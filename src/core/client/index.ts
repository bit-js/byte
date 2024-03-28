import type { BaseByte } from '../server';
import { BitClient, type Client } from './client';

const fetchFn = globalThis.fetch.bind(globalThis);

/**
 * A type safe client
 */
export function bit<T extends BaseByte>(url: string, fetcher: (req: Request) => Promise<any> = fetchFn): Client<T> {
    return new BitClient(url, fetcher) as any;
}

// Types
export * from './types/route';
export * from './types/requestProps';

// Client internals
export * from './client';
export { default as stringifyQuery } from './utils/stringifyQuery';
export { default as serialize } from './utils/serialize';
export { default as getInjectFn } from './utils/pathInject';

