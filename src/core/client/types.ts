import type { ParamsKey } from '@bit-js/blitz';
import { type Byte, type BaseRoute, type RoutesRecord } from '../server';

// Utils type
type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

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
type Promisify<T> = T extends Promise<any> ? T : Promise<T>;
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

// Infer a single route
type RouteFunc<Path extends string, Init extends RequestProps, Return> =
    RequiredKeys<Init> extends never
    ? (path: Path, init?: RequestProps) => Promisify<Return>
    : (path: Path, init: Init) => Promisify<Return>;

export type InferRoute<T extends BaseRoute> = {
    [K in T['method']]: RouteFunc<
        T['path'], RequestProps & SetParams<T>,
        ReturnOf<T['handler']>
    >;
};

export type InferRoutes<T extends RoutesRecord> = T extends [infer Route extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? InferRoute<Route> | InferRoutes<Rest> : {};

/**
 * Infer client type
 */
export type InferClient<T extends Byte<any>> = UnionToIntersection<InferRoutes<T['routes']>>;

export type Fetcher = typeof fetch;
