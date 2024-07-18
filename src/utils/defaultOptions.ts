import type { Fn } from '../core';

export const emptyObj = {} as const;
export const emptyList = [];

export const default404res = new Response(null, { status: 404 });
export const default403res = new Response(null, { status: 403 });
export const default404: Fn = () => default404res;

export const noop = () => null;
