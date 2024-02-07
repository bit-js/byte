import type Byte from '.';

import type { Client, RequestOptions } from './client/types';
import serialize from './client/serialize';

import { methods } from './core/method';

// Implementation 
const noop = {}, paramsRegex = /\$(\w+)/g, isProxied = Symbol('isProxy');

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
                typeof params === 'undefined' ? url : url.replace(paramsRegex, match => {
                    const val = (params as any)[match.slice(1)];
                    return typeof val === 'undefined' ? '' : serialize(val);
                }), init
            );
        }
    }

    return new Proxy(base, {
        get(_, p: string) {
            const val = store[p];

            if (typeof val !== 'object') {
                const path = `${url}/${p}`;

                // Handle function collision (get, post, put, ...)
                if (typeof val === 'function') {
                    if (isProxied in val) return val;
                    return store[p] = createProxy(path, val);
                }

                // Cache properties that are not set
                return store[p] = createProxy(path, noop);
            }

            return val;
        },
        has(_, p) {
            return p === isProxied || p in store;
        }
    })
}

/**
 * Create a Byte client
 */
export default function bit<App extends Byte<any>>(href: string): Client<App> {
    return createProxy(href, noop);
}
