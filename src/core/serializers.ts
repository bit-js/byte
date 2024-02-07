import type { Context, Handler } from './types';

export interface SerializersGroup extends Record<string, (o: any, ctx: Context) => any> { };

const yieldFn = (o: any) => o, toStr = (o: any) => o.toString();

export const objectSerializers: SerializersGroup = {
    Object: (o, ctx) => {
        ctx.headers['Content-Type'] = 'application/json';
        return JSON.stringify(o);
    },
    Buffer: yieldFn,
    Response: yieldFn,
    ArrayBuffer: yieldFn,
    URLSearchParams: yieldFn
};

export const serializers: SerializersGroup = {
    number: toStr,
    boolean: toStr,
    // Idk whatever
    function: toStr,
    string: yieldFn,
    undefined: () => null,
    object: (o, ctx) => o === null ? null : objectSerializers[o.constructor.name](o, ctx)
} as const;

/**
 * Serialize an abitrary entity
 */
export const serialize = (o: any, ctx: Context): any => serializers[typeof o](o, ctx);
/**
 * Wrap a handler
 */
export default function wrap(f: Function): Handler {
    return f.constructor.name === 'AsyncFunction'
        ? async ctx => new Response(serialize(await f(ctx), ctx), ctx as any)
        : ctx => new Response(serialize(f(ctx), ctx), ctx as any);
}
