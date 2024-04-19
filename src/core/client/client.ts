import type { BaseByte, InferByteRecord } from '../server';

import serialize from './utils/serialize';
import getInjectFn from './utils/pathInject';
import stringifyQuery from './utils/stringifyQuery';

import type { UnionToIntersection } from '../utils/types';

import type { InferRoutes } from './types/route';
import { emptyObj } from '../../utils/defaultOptions';
import ClientProto from './utils/clientProto';

/**
 * Infer client type
 */
export type InferClient<T extends BaseByte> = UnionToIntersection<InferRoutes<InferByteRecord<T>>>;

/**
 * Customize client
 */
export interface ClientOptions {
    fetch?(req: Request): Promise<any>;
    init?: RequestInit;
}

const fetchFn = globalThis.fetch.bind(globalThis);

// Bit client prototype
export class BitClient extends ClientProto {
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
        super();

        if (typeof options === 'undefined') {
            this.fetch = fetchFn;
            this.defaultInit = emptyObj;
        } else {
            this.fetch = options.fetch ?? fetchFn;
            this.defaultInit = options.init ?? emptyObj;
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
            // @ts-expect-error Set new keys to init
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

export type Client<T extends BaseByte> = InferClient<T> & BitClient;


