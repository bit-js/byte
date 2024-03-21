import { Context as TypedContext, type Params } from '@bit-js/blitz';

import type { AwaitedReturn, NormalizePath, TrimEnd } from '../utils/types';
import type { GenericResponse } from './utils/responses';

import type { BaseByte, Byte } from '.';

// Basic handler
export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => GenericResponse;

// A function with one argument
export type Fn<R = any> = (c: BaseContext) => R;

// Validator
export type ValidatorProp<T, Prop extends string> = { [K in Prop]: ValidatorResult<T> };
export type ValidatorResult<T> = Exclude<AwaitedReturn<T>, Response>;

// Validators group of a route
export type ValidatorRecord<Path extends string = any> = Record<string, (c: Context<Params<Path>>) => any> | null;

// Infer validator type
export type InferValidator<T extends ValidatorRecord> = T extends null ? undefined : {
    [K in Extract<keyof T, string>]: Exclude<AwaitedReturn<T[K]>, GenericResponse>;
}

// Base context
export class Context<Params, State = undefined> extends TypedContext<Params> {
    state!: State;
    headers: Record<string, string> = {};
};
export type BaseContext = Context<any, any>;

// A singular route record
const emptyList: Fn[] = [];
const doubleSlashRegex = /\/\//g;

export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    validator: Validator = null as Validator;
    actions: Fn[] = emptyList;

    constructor(public method: Method, public path: Path, public handler: Handler) { }

    clone(base: string, app: BaseByte) {
        const route = new Route<Method, any, Handler, Validator>(this.method, this.path, this.handler);

        // Merge actions
        route.actions = app.concatActions(this.actions);
        // Merge path
        route.path = (base + this.path).replace(doubleSlashRegex, '/');

        return route;
    }
}

export type BaseRoute = Route<any, any, any, any>;

export type SetBasePath<T extends BaseRoute, Base extends string> = Omit<T, 'path'> & {
    path: `${TrimEnd<Base>}${NormalizePath<T['path']>}`
};

export type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [SetBasePath<Current, Base>, ...SetBase<Base, Rest>]
    : [];

// Route list
export type RoutesRecord = BaseRoute[];

/**
 * A plugin
 */
export interface Plugin {
    plug(app: Byte<any>): any;
}
