import type { BaseByte } from '../server';
import type { Fetcher, InferClient } from './types';
import serialize from './serialize';

import { injectProto } from '../utils/methods';

type PathInjectFunction = (params: Record<string, any>) => string;
const injectPath: Record<string, PathInjectFunction> = {};

// Include compilation to literal string for better performance in next invocation
function buildFunc(path: string, parts: string[]): PathInjectFunction {
    // Insert the function into the cache
    const fn = Function(`return p=>\`${parts.join('')}\``)();
    injectPath[path] = fn;
    return fn;
}

// Inject parameter to the path
function buildPathInject(path: string) {
    const parts: string[] = [];

    let paramIdx = path.indexOf(':'), start = 0;
    while (paramIdx !== -1) {
        if (paramIdx !== start)
            parts.push(path.substring(start, paramIdx));

        ++paramIdx;
        start = path.indexOf('/', paramIdx);

        if (start === -1) {
            parts.push(`\${p.${path.substring(paramIdx)}}`);
            return buildFunc(path, parts);
        }

        parts.push(`\${p.${path.substring(paramIdx, start)}}`);
        paramIdx = path.indexOf(':', start + 1);
    };

    // Wildcard check
    if (path.charCodeAt(path.length - 1) === 42)
        parts.push(`${path.substring(start, path.length - 2)}\${p.$}`);
    else
        parts.push(path.substring(start));

    return buildFunc(path, parts);
}

function stringifyQuery(query: Record<string, string | number | boolean>) {
    const parts = [];

    for (const key in query) {
        if (query[key] === false) continue;
        parts.push(query[key] === true ? encodeURIComponent(key) : `${encodeURIComponent(key)}=${encodeURIComponent(query[key].toString())}`);
    }

    return `?${parts.join('&')}`;
}

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
            `${this.url}${typeof params === 'undefined'
                ? path : (injectPath[path] ?? buildPathInject(path))(params)
            }${typeof query === 'undefined' ? '' : stringifyQuery(query)}`, init
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


