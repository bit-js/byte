import type { ParamsKey } from '@bit-js/blitz';
import type { Byte, BaseRoute, RoutesRecord, BaseValidatorRecord, ValidatorProp } from '../server';

// Utils type
type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Infer body from validator
type SetBody<T extends BaseValidatorRecord> = T extends undefined ? {} : (
    T extends { body: infer F } ? ValidatorProp<F, 'body'> : {}
);

// Parameter types
type ParamValue = string | number | boolean;
type SetParams<V extends string> = ParamsKey<V> extends never ? {} : {
    /**
     * Rest parameter ('$') must start with a slash
     */
    params: { [K in ParamsKey<V>]: ParamValue }
};

// Main types
type RequestBaseProps = Omit<RequestInit, 'body'>;
export type RequestProps<T extends BaseRoute> = RequestBaseProps & SetParams<T['path']> & SetBody<T['validator']>;

type Promisify<T> = T extends Promise<any> ? T : Promise<T>;
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

// Infer a single route
type RouteFunc<Path extends string, Init, Return> =
    RequiredKeys<Init> extends never
    ? (path: Path, init?: RequestBaseProps) => Promisify<Return>
    : (path: Path, init: Init) => Promisify<Return>;

export type InferRoute<T extends BaseRoute> = {
    [K in T['method']]: RouteFunc<
        T['path'], RequestProps<T>,
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
