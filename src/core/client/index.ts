import type { BaseByte } from '../server';
import { BitClient, type Client } from './client';
import type { Fetcher } from './types';

const fetchFn = globalThis.fetch.bind(globalThis);

/**
 * A type safe client
 */
export function bit<T extends BaseByte>(url: string, fetcher: Fetcher = fetchFn): Client<T> {
    return new BitClient(url, fetcher) as any;
}

export * from './types';
export * from './client';
