import { $pass, type CommonHeaders, type Fn } from '../../core/server';

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
    return typeof value === 'string' ? value : value.join(',');
}

const allowCredentials = ['Access-Control-Allow-Credentials', 'true'] satisfies CommonHeaders[number];
const allowAllOrigins = ['Access-Control-Allow-Origin', '*'] satisfies CommonHeaders[number];
const varyOrigin = ['Vary', 'Origin'] satisfies CommonHeaders[number];

const defaultCors: Fn = $pass((c) => { c.headers.push(allowAllOrigins); });

/**
 * Create a CORS action function
 */
export function cors(options?: CORSOptions) {
    if (typeof options === 'undefined') return defaultCors;

    const builder: CommonHeaders = [];

    // Check basic properties
    if (typeof options.allowHeaders !== 'undefined')
        builder.push(['Access-Control-Allow-Headers', parseValue(options.allowHeaders)]);
    if (typeof options.allowMethods !== 'undefined')
        builder.push(['Access-Control-Allow-Methods', parseValue(options.allowMethods)]);

    if (typeof options.exposeHeaders !== 'undefined')
        builder.push(['Access-Control-Expose-Headers', parseValue(options.exposeHeaders)]);
    if (typeof options.maxAge === 'number')
        builder.push(['Access-Control-Max-Age', options.maxAge + '']);
    if (options.allowCredentials === true)
        builder.push(allowCredentials);

    // Check allow origins
    if (typeof options.allowOrigin === 'string' && options.allowOrigin !== '*')
        builder.push(['Access-Control-Allow-Origin', options.allowOrigin], varyOrigin);
    else
        builder.push(allowAllOrigins);

    // Small optimization
    if (builder.length === 1) {
        const first = builder[0];
        return $pass((c) => { c.headers.push(first); })
    }

    return $pass((c) => { c.headers.push(...builder); });
}

