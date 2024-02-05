import type { RoutesRecord, Route } from '../core/methods';
import type Byte from '..';

export interface RequestOptions<Params = any, Body = any> extends Omit<RequestInit, 'body'> {
    body?: Body;
    params?: Params;
}

export type Primitive = string | number | bigint | boolean | null | undefined;

export interface ClientResponse<Body = any> extends ResponseInit {
    text(): Promise<Body extends Primitive ? `${Body}` : string>;
    json(): Promise<Body extends Primitive ? never : Body>;
}

export type UnionToIntersection<U> = (
    U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void ? I : never

// Path chaining
type PathPart<Path extends string> = Path extends `:${infer Rest}` ? `$${Rest}` : Path;

export type Chain<Path extends string, Result> = Path extends `${infer Current}/${infer Rest}`
    ? { [K in PathPart<Current>]: Chain<Rest, Result> }
    : Path extends '' ? Result : { [K in Path extends '*' ? string : PathPart<Path>]: Result };

// Infer a route
type NormalizePath<P extends string> = P extends `/${infer Rest}` ? Rest : P;

/**
 * Extract parameters from a path
 */
export type Params<T extends string> = T extends `${infer Segment}/${infer Rest}` ? (Segment extends `:${infer Param}` ? ({
    [K in Param]: Primitive;
} & Params<Rest>) : {}) & Params<Rest> : T extends `:${infer Param}` ? {
    [K in Param]: Primitive;
} : T extends `*` ? {
    '*': Primitive;
} : {};

export type RouteInfer<T extends Route> = Chain<NormalizePath<T['path']>, {
    [K in T['method']]: (init?: RequestOptions<Params<T['path']>>) => Promise<
        ClientResponse<Awaited<ReturnType<T['handler']>>>
    >
}>;

// Infer routes and merge
export type Infer<T extends RoutesRecord> = T extends [infer Current extends Route, ...infer Rest extends RoutesRecord]
    ? RouteInfer<Current> | Infer<Rest>
    : never;

export type Client<T extends Byte<any>> = UnionToIntersection<Infer<T['record']>>;
