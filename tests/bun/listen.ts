import { bit } from '@bit-js/byte';
import { fetch, type App } from '@app';

/**
 * Serve the app using Bun and create a bit client
 */
export default function listen(port: number | string) {
    const server = Bun.serve({ fetch, port });
    return bit<App>(server.url.href);
}
