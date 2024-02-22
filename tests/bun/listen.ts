import { bit, type Byte } from '@bit-js/byte';

/**
 * Serve the app using Bun and create a bit client
 */
export default function listen<App extends Byte<any>>(app: App, port: number | string) {
    const server = Bun.serve({ fetch: app.fetch, port, development: false });
    return bit<App>(server.url.href);
}
