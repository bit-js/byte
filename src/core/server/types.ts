import { Context as TypedContext, type Params } from '@bit-js/blitz';

import type { AwaitedReturn } from '../utils/types';
import type { GenericResponse } from './utils/responses';

import type { Byte } from '.';

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
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    method: Method;
    path: Path;
    handler: Handler;
    validator: Validator;
    actions: Fn[] | null;
}
export type BaseRoute = Route<any, any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];

/**
 * A plugin
 */
export interface Plugin {
    plug(app: Byte<any>): any;
}
