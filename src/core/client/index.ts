import type { BaseByte } from '../server';
import { BitClient, type Client, type ClientOptions } from './client';

/**
 * A type safe client
 */
export function bit<T extends BaseByte>(url: string, options?: ClientOptions): Client<T> {
    return typeof options === 'undefined' ? new BitClient(url) : new BitClient(url, options) as any;
}

// Types
export * from './types/route';
export * from './types/requestProps';

// Client internals
export * from './client';
export { default as stringifyQuery } from './utils/stringifyQuery';
export { default as serialize } from './utils/serialize';
export { default as getInjectFn } from './utils/pathInject';

