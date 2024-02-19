import type { ParamsKey } from '@bit-js/blitz';
import { type Byte, type BaseRoute, type RoutesRecord, methods } from './server';

// Utils type
type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;

// Parameter types
type RouteParams<T extends BaseRoute> = ParamsKey<T['path']>;
type ParamValue = string | number | boolean;
type SetParamKeys<V extends string> = V extends never ? {} : {
    params: { [K in V]: ParamValue }
};
type SetParams<T extends BaseRoute> = SetParamKeys<RouteParams<T>>;

// Main types
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> { }

export interface ClientResponse<R> extends Response {
    text(): Promise<R extends string ? R : string>;
    json(): Promise<R>;
}

export type InferRoute<T extends BaseRoute> = {
    [K in T['method']]: (path: T['path'], init?: RequestOptions & SetParams<T>) => Promise<
        ClientResponse<AwaitedReturn<T['handler']>>
    >;
};

export type InferRoutes<T extends RoutesRecord> = T extends [infer Route extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? InferRoute<Route> | InferRoutes<Rest>
    : {};

export type Client<T extends Byte<any>> = UnionToIntersection<InferRoutes<T['record']>>;

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
function injectParams(path: string, params: Record<string, ParamValue>) {
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

console.log(injectParams('/user/:id/v/:name', {
    id: 90,
    name: 'R'
}))
