import { methods, type Byte } from '../server';
import type { Client } from './types';

// Main stuff
function createFetcher(url: string, method: string): Function {
    const defaultInit = { method };

    return (path: string, init?: any) => {
        init ??= defaultInit;
        init.method ??= method;

        if (typeof init.params !== 'undefined')
            path = injectParams(path, init.params);

        return fetch(url + path, init);
    }
};

/**
 * Inject parameter to the path
 */
function injectParams(path: string, params: Record<string, any>) {
    const parts: string[] = [];

    let paramIdx = path.indexOf(':'), start = 0;
    while (paramIdx !== -1) {
        if (paramIdx !== start)
            parts.push(path.substring(start, paramIdx));

        ++paramIdx;
        start = path.indexOf('/', paramIdx);

        if (start === -1) {
            parts.push(params[path.substring(paramIdx)].toString());
            return parts.join('');
        }

        parts.push(params[path.substring(paramIdx, start)].toString());
        paramIdx = path.indexOf(':', start + 1);
    };

    // Wildcard check
    if (path.charCodeAt(path.length - 1) === 42) {
        parts.push(path.substring(start, path.length - 2));

        const wildcardValue = params.$.toString();

        // Push additional slash if wildcard does not start with slash
        if (wildcardValue.charCodeAt(0) !== 47) parts.push('/');
        parts.push(wildcardValue);
    }

    // Slice last static path
    else parts.push(path.substring(start));

    return parts.join('');
}

/**
 * A fast type safe client
 */
export function bit<T extends Byte<any>>(url: string): Client<T> {
    // Normalize URL
    const lastIdx = url.length - 1;
    if (url.charCodeAt(lastIdx) === 47) url = url.substring(0, lastIdx);

    const client: any = {};
    for (let i = 0, { length } = methods; i < length; ++i)
        client[methods[i]] = createFetcher(url, methods[i].toUpperCase());

    client.$ = client.get;
    return client;
}

export * from './types';
