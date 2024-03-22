import type { BaseRoute, RoutesRecord } from '../../server';
import type { Promisify, RequiredKeys, ReturnOf } from '../../utils/types';
import type { RequestBaseProps, RequestProps } from './requestProps';

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
