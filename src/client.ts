import type Byte from '.';

import type { Client, RequestOptions } from './client/types';
import serialize from './client/serialize';

import { methods } from './core/methods';

// Implementation 
const noop = {};
function createProxy(url: string, base: object): any {
    const store: Record<string, any> = {};

    for (let i = 0, { length } = methods; i < length; ++i) {
        const METHOD = methods[i].toUpperCase();

        store[methods[i]] = (init: RequestOptions<any>) => {
            init ??= {};
            init.method = METHOD;

            // Parse body
            init.body = serialize(init.body);

            const { params } = init;
            return fetch(
                // Parse params
                typeof url === 'undefined' ? url : url.replace(/\[\w+\]/g, match => {
                    const val = (params as any)[match.slice(1, -1)];
                    return typeof val === 'undefined' ? '' : serialize(val);
                }), init
            );
        }
    }

    return new Proxy(base, {
        get(_, p: string) {
            if (p.startsWith('$'))
                p = `[${p.slice(1)}]`;

            const val = store[p];

            // This includes function (get, post, put, ...)
            if (typeof val !== 'object')
                store[p] = createProxy(
                    `${url}/${p}`, typeof val === 'undefined' ? noop : val
                )

            return store[p];
        }
    })
}

/**
 * Create a Byte client
 */
export default function bit<App extends Byte<any>>(href: string): Client<App> {
    return createProxy(href, noop);
}
