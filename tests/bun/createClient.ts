import { bit, type Byte } from '@bit-js/byte';
import type { Serve } from 'bun';

/**
 * Serve the app using Bun and create a bit client
 */
export default function createClient<T extends Byte<any>>(serve: Serve) {
    const server = Bun.serve(serve);
    return bit<T>(server.url.href);
}
