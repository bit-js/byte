import type { Context, Handler } from './types';

export interface SerializersGroup extends Record<string, (o: any, ctx: Context) => any> { };

export const objectSerializers: SerializersGroup = {
    Object: (o, ctx) => {
        // @ts-ignore
        ctx.headers['Content-Type'] ??= 'application/json';
        return JSON.stringify(o);
    }
};

export const serializers: SerializersGroup = {
    number: (o: number) => o.toString(),
    boolean: (o: boolean) => o.toString(),
    function: (o: Function) => o.toString(),
    string: (o: string) => o,
    undefined: () => null,
    object: (o: object, ctx: Context) => {
        if (o === null) return null;

        const serializer = objectSerializers[o.constructor.name];
        return typeof serializer === 'undefined' ? o : serializer(o, ctx);
    }
} as const;

/**
 * Serialize an abitrary entity
 */
const serialize = (o: any, ctx: Context): any => serializers[typeof o](o, ctx);

/**
 * Wrap a handler
 */
export default function wrap(f: Function): Handler {
    return f.constructor.name === 'AsyncFunction'
        ? async ctx => new Response(serialize(await f(ctx), ctx), ctx as any)
        : ctx => new Response(serialize(f(ctx), ctx), ctx as any);
}
