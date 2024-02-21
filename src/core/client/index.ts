import type { Byte } from '../server';
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
function buildPathInject(path: string): PathInjectFunction {
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

// Bit client prototype
class Client {
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
            return this.fetch(this.url + path);

        const { params, body } = init;
        if (typeof body !== 'undefined')
            init.body = serialize(body);

        return this.fetch(
            // Cast URL parameters
            this.url + (typeof params === 'undefined'
                ? path : (injectPath[path] ?? buildPathInject(path))(params)
            ), init
        );
    };
}

// Inject method fetcher
injectProto(Client, method => {
    const defaultInit = { method };

    return function(this: Client, path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, defaultInit);

        init.method = method;
        return this.$(path, init);
    }
});

const fetchFn = fetch.bind(globalThis);
/**
 * A fast type safe client
 */
export function bit<T extends Byte<any>>(url: string, fetcher: Fetcher = fetchFn): InferClient<T> & Client {
    return new Client(url, fetcher) as any;
}

export * from './types';
