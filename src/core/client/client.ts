import type { BaseByte } from '../server';

import serialize from './utils/serialize';
import { injectProto } from '../utils/methods';
import getInjectFn from './utils/pathInject';
import stringifyQuery from './utils/stringifyQuery';

import type { UnionToIntersection } from '../utils/types';

import type { InferRoutes } from './types/route';
import { emptyObj } from '../../utils/defaultOptions';

/**
 * Infer client type
 */
export type InferClient<T extends BaseByte> = UnionToIntersection<InferRoutes<T['routes']>>;

/**
 * Customize client
 */
export interface ClientOptions {
    fetch?(req: Request): Promise<any>;
    init?: RequestInit;
}

const fetchFn = globalThis.fetch.bind(globalThis);

// Bit client prototype
export class BitClient {
    /**
     * Base URL
     */
    readonly url: string;

    /**
     * Fetch function
     */
    readonly fetch: ClientOptions['fetch'] & {};

    /**
     * Default response init
     */
    readonly defaultInit: ClientOptions['init'] & {};

    constructor(url: string, options?: ClientOptions) {
        if (typeof options === 'undefined') {
            this.fetch = fetchFn;
            this.defaultInit = emptyObj;
        } else {
            const { fetch, init } = options;

            this.fetch = typeof fetch === 'function' ? fetch : fetchFn;
            this.defaultInit = typeof init === 'undefined' ? emptyObj : init;
        }

        // Normalize URL
        const lastIdx = url.length - 1;
        this.url = url.charCodeAt(lastIdx) === 47 ? url.substring(0, lastIdx) : url;
    }

    $(path: string, init?: any) {
        const { defaultInit } = this;
        if (typeof init === 'undefined')
            return this.fetch(new Request(this.url + path, defaultInit));

        for (const key in defaultInit)
            // @ts-expect-error Somehow it errors
            init[key] ??= defaultInit[key];

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


