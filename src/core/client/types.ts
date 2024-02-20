import type { ParamsKey } from '@bit-js/blitz';
import { type Byte, type BaseRoute, type RoutesRecord } from '../server';

// Utils type
type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;

// Parameter types
type ParamValue = string | number | boolean;
type SetParamsKey<V extends string> = V extends never ? {} : {
    /**
     * Rest parameter ('$') must start with a slash
     */
    params: { [K in V]: ParamValue }
};
type SetParams<T extends BaseRoute> = SetParamsKey<ParamsKey<T['path']>>;

// Main types
type RequestProps = Omit<RequestInit, 'body'>;
export type RequestOptions<T extends BaseRoute> = RequestProps & SetParams<T>;

export type InferRoute<T extends BaseRoute> = {
    [K in T['method']]: (path: T['path'], init?: RequestOptions<T>) => Promise<
        AwaitedReturn<T['handler']>
    >;
};

export type InferRoutes<T extends RoutesRecord> = T extends [infer Route extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? InferRoute<Route> | InferRoutes<Rest> : {};

/**
 * Infer client type
 */
export type InferClient<T extends Byte<any>> = UnionToIntersection<InferRoutes<T['routes']>>;

export type Fetcher = typeof fetch;
