import type { ParamsKey } from '@bit-js/blitz';
import type { BaseRoute, RoutesRecord, ValidatorProp, ValidatorRecord, BaseByte } from '../server';
import type { Promisify, RequiredKeys, ReturnOf, UnionToIntersection } from '../utils/types';

// Infer body from validator
type SetBody<T extends ValidatorRecord> = T extends null ? {} : (
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
interface RequestBaseProps extends Omit<RequestInit, 'body'> {
    query?: Record<string, string | number | boolean>;
};
export type RequestProps<T extends BaseRoute> = RequestBaseProps & SetParams<T['path']> & SetBody<T['validator']>;

// Infer a single route
type RouteFunc<Path extends string, Init, Return> =
    // Force to provide additional fields if exists
    RequiredKeys<Init> extends never
    ? (path: Path, init?: RequestBaseProps) => Promisify<Return>
    : (path: Path, init: Init) => Promisify<Return>;

export type InferRoute<T extends BaseRoute> = {
    [K in T['method']]: RouteFunc<
        T['path'],
        RequestProps<T>,
        ReturnOf<T['handler']>
    >;
};

export type InferRoutes<T extends RoutesRecord> = T extends [infer Route extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? InferRoute<Route> | InferRoutes<Rest> : {};

/**
 * Infer client type
 */
export type InferClient<T extends BaseByte> = UnionToIntersection<InferRoutes<T['routes']>>;

export type Fetcher = (req: Request) => Promise<any>;
