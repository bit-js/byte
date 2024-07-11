import type { BaseRoute, RoutesRecord } from '../../server';
import type { Promisify, RequiredKeys, AwaitedReturn } from '../../utils/types';
import type { RequestBaseProps, RequestProps } from './requestProps';

// Infer a single route
type RouteFunc<Path extends string, Init, Return> =
    // Force to provide additional fields if exists
    RequiredKeys<Init> extends never
    ? (path: Path, init?: RequestBaseProps) => Return
    : (path: Path, init: Init) => Return;

type InferReturn<T extends BaseRoute> = Promisify<AwaitedReturn<T['handler']>>;

export type InferRoute<T extends BaseRoute, FallbackResponse> = {
    [K in T['method']]: RouteFunc<
        T['path'],
        RequestProps<T>,
        FallbackResponse | InferReturn<T>
    >;
};

export type InferRoutes<T extends RoutesRecord, FallbackResponse> = T extends [infer Route extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? InferRoute<Route, FallbackResponse> | InferRoutes<Rest, FallbackResponse> : {};
