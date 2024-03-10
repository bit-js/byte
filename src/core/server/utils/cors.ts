import type { BaseContext } from '../types';

export interface CORSHeaderOptions {
    allowOrigins?: string | string[];
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    maxAge?: number;
    allowCredentials?: boolean;
    allowHeaders?: string | string[];
}

function parseValue(value: string | string[]): string {
    return typeof value === 'string' ? value : value.join(',');
}

class CORSHeaders {
    // All CORS headers
    public 'Access-Control-Allow-Origin'?: string;
    public Vary?: string;

    public 'Access-Control-Allow-Methods'?: string;
    public 'Access-Control-Expose-Headers'?: string;
    public 'Access-Control-Allow-Headers'?: string;
    public 'Access-Control-Allow-Credentials'?: 'true';
    public 'Access-Control-Max-Age'?: string;
}

export class CORS {
    // All CORS headers
    public readonly headers: Record<string, string>;
    public readonly allowOrigins?: string[];

    public constructor(options?: CORSHeaderOptions) {
        const headers = new CORSHeaders();

        if (typeof options === 'object') {
            if (typeof options.allowMethods !== 'undefined')
                headers['Access-Control-Allow-Methods'] = parseValue(options.allowMethods);
            if (typeof options.exposeHeaders !== 'undefined')
                headers['Access-Control-Expose-Headers'] = parseValue(options.exposeHeaders);
            if (typeof options.maxAge === 'number')
                headers['Access-Control-Max-Age'] = options.maxAge.toString();
            if (options.allowCredentials === true)
                headers['Access-Control-Allow-Credentials'] = 'true';
            if (typeof options.allowHeaders !== 'undefined')
                headers['Access-Control-Allow-Headers'] = parseValue(options.allowHeaders);

            const { allowOrigins } = options;
            if (typeof allowOrigins !== 'undefined') {
                if (typeof allowOrigins === 'string')
                    headers['Access-Control-Allow-Origin'] = allowOrigins;
                else {
                    if (allowOrigins.length < 2)
                        headers['Access-Control-Allow-Origin'] = allowOrigins.length === 0 ? '*' : allowOrigins[1];
                    else {
                        this.allowOrigins = allowOrigins;
                        headers['Access-Control-Allow-Origin'] = '*';
                    }
                }

                headers['Vary'] = 'Origin';
            }
            else headers['Access-Control-Allow-Origin'] = '*';
        }

        this.headers = headers as Record<string, string>;
    }

    build(): (ctx: BaseContext) => void {
        const { headers, allowOrigins } = this;

        if (typeof allowOrigins === 'undefined')
            return Function(`return (c)=>{c.headers=${JSON.stringify(headers)}}`)();

        return Function(`const m={${allowOrigins.map(mark).join('')}};return (c)=>{const h=${JSON.stringify(headers)};const o=c.req.url.substring(0,c.pathStart-1);if(m[o]!==null)h['Access-Control-Allow-Origin']='null';c.headers=h;}`)();
    }
}

function mark(origin: string) {
    return JSON.stringify(origin) + ':null';
}
