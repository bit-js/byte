import { bit, type Byte } from '@bit-js/byte';

function replacer(_: any, value: any) {
    return typeof value === 'function' ? value.toString() : value;
}

/**
 * Serve the app using Bun and create a bit client
 */
export default function listen<App extends Byte<any>>(app: App) {
    const { fetch } = app;

    // Router debug
    console.log(JSON.stringify(app.router, replacer, 4));

    // Return the app client
    return bit<App>('http://localhost:3000', fetch);
}
