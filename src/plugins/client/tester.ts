import type { BaseByte } from '../../core/server';
import { BitClient, type Client } from '../../core/client';

/**
 * Create a type safe test client (use for unit testing)
 */
export function tester<T extends BaseByte>(app: T): Client<T> {
    return new BitClient('http://127.0.0.1', app.fetch) as any;
}
