import type { BaseByte } from '../server';
import type { Fetcher, InferClient } from './types';
import serialize from './utils/serialize';

import { injectProto } from '../utils/methods';

import getInjectFn from './utils/pathInject';
import stringifyQuery from './utils/stringifyQuery';

// Bit client prototype
export class BitClient {
    /**
     * Base URL
     */
    readonly url: string;

    constructor(url: string, readonly fetch: Fetcher) {
        // Normalize URL
        const lastIdx = url.length - 1;
        this.url = url.charCodeAt(lastIdx) === 47 ? url.substring(0, lastIdx) : url;
    }

    $(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.fetch(new Request(this.url + path));

        const { params, body, query } = init;
        if (typeof body !== 'undefined')
            init.body = serialize(body);

        return this.fetch(new Request(
            // Cast URL parameters
            `${this.url}${typeof params === 'undefined' ? path : getInjectFn(path)(params)}${stringifyQuery(query)}`, init
        ));
    };
}

// Inject method fetcher
injectProto(BitClient, method => {
    const defaultInit = { method };

    return function(this: BitClient, path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, defaultInit);

        init.method = method;
        return this.$(path, init);
    }
});

export type Client<T extends BaseByte> = InferClient<T> & BitClient;


