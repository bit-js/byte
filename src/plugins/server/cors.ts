import { $pass, type Fn } from '../../core/server';

type Values = string | string[];

export interface CORSOptions {
    allowOrigin?: string;
    allowMethods?: Values;
    exposeHeaders?: Values;
    maxAge?: number;
    allowCredentials?: boolean;
    allowHeaders?: Values;
}

function parseValue(value: Values) {
    return JSON.stringify(typeof value === 'string' ? value : value.join(','));
}

const defaultCors: Fn = $pass((c) => {
    c.headers['Access-Control-Allow-Origin'] = '*';
});

/**
 * Create a CORS action function
 */
export function cors(options?: CORSOptions) {
    if (typeof options === 'undefined') return defaultCors;
    const builder: string[] = [];

    // Check basic properties
    if (typeof options.allowHeaders !== 'undefined')
        builder.push(`headers['Access-Control-Allow-Headers']=${parseValue(options.allowHeaders)};`);
    if (typeof options.allowMethods !== 'undefined')
        builder.push(`headers['Access-Control-Allow-Methods']=${parseValue(options.allowMethods)};`);
    if (typeof options.exposeHeaders !== 'undefined')
        builder.push(`headers['Access-Control-Expose-Headers']=${parseValue(options.exposeHeaders)};`);
    if (typeof options.maxAge === 'number')
        builder.push(`headers['Access-Control-Max-Age']=${options.maxAge.toString()};`);
    if (options.allowCredentials === true)
        builder.push(`headers['Access-Control-Allow-Credentials']='true';`);

    // Check allow origins
    if (typeof options.allowOrigin === 'string' && options.allowOrigin !== '*')
        builder.push(`headers['Access-Control-Allow-Origin']=${JSON.stringify(options.allowOrigin)};headers.Vary='Origin';`);
    else
        builder.push(`headers['Access-Control-Allow-Origin']='*';`);

    return $pass(Function(`return ({headers})=>{${builder.join('')}}`)());
}

