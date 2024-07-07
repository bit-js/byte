import type { Fn } from '../core';

export const forbidden: ResponseInit = { status: 403 } as const;
export const emptyObj = {} as const;
export const emptyList = [];

export const default404: Fn = (ctx) => {
    ctx.status = 404;
    return new Response(`Cannot ${ctx.req.method} ${ctx.path}`, ctx as ResponseInit);
}

export const noop = () => null;
