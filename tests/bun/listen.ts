import { bit, type Byte } from '@bit-js/byte';

function replacer(_: any, value: any) {
    return typeof value === 'function' ? value.toString() : value;
}

/**
 * Serve the app using Bun and create a bit client
 */
export default function listen<App extends Byte<any>>(app: App, port: number | string) {
    const server = Bun.serve({ fetch: app.fetch, port, development: false });

    // Router debug
    console.log(JSON.stringify(app.router, replacer, 4));

    // Return the app client
    return bit<App>(server.url.href);
}
