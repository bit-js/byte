import type { Fn } from '../core';

export const forbidden: ResponseInit = { status: 403 } as const;
export const emptyObj = {} as const;
export const emptyList = [];

const default404res = new Response(null, { status: 404 });
export const default404: Fn = () => default404res.clone();

export const noop = () => null;
