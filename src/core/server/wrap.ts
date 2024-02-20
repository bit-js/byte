import type { Context } from './types';

type Serializer = (input: any, ctx: Context<any>) => Response | Promise<Response>;

const yieldInput: Serializer = (input, ctx) => new Response(input, ctx);
const inputToString: Serializer = (input, ctx) => new Response(input.toString(), ctx);
const noop: Serializer = (_, ctx) => new Response(null, ctx);

const objectSerializers: Record<string, Serializer> = {
    // Stringify object literal
    Object: (input, ctx) => {
        ctx.headers['Content-Type'] ??= 'application/json';
        return new Response(JSON.stringify(input), ctx);
    },
    // Try serialize promise
    Promise: async (input, ctx) => {
        const res = await input;
        return serializers[typeof res](res, ctx);
    },

    URLSearchParams: yieldInput,
    ArrayBuffer: yieldInput,
    FormData: yieldInput,
    Blob: yieldInput,
    ReadableStream: yieldInput,
    Response: yieldInput
};

const serializers = {
    string: yieldInput,

    boolean: inputToString,
    symbol: inputToString,
    bigint: inputToString,
    number: inputToString,

    function: noop,
    undefined: noop,

    object: (input, ctx) => input === null ? new Response(null, ctx) : (objectSerializers[input.constructor.name] ?? yieldInput)(input, ctx)
} satisfies Record<string, Serializer>;

export default function wrap(f: any): any {
    return Function('f', 's', `return c=>{const t=f(${f.length === 0 ? '' : 'c'});return s[typeof t](t,c)}`)(f, serializers);
};
