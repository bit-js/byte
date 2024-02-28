import { Context as TypedContext, type Params } from '@bit-js/blitz';

import type { AwaitedReturn } from '../utils/types';

import type { GenericResponse } from './utils/responses';

// Basic handler
export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => GenericResponse;

// A function with one argument
export type Fn<R = any> = (c: Context<any, any>) => R;

// Validator
export type ValidatorProp<T, Prop extends string> = { [K in Prop]: ValidatorResult<T> };
export type ValidatorResult<T> = Exclude<AwaitedReturn<T>, Response>;

export type BaseValidator<Path extends string> = (c: Context<Params<Path>>) => any;
export type ValidatorRecord<Path extends string> = Record<string, BaseValidator<Path>>;

export type InferValidator<T extends ValidatorRecord<any> | undefined> = T extends undefined ? undefined : {
    [K in Extract<keyof T, string>]: ValidatorResult<T[K]>;
}

// Base context
export class Context<Params, State = undefined> extends TypedContext<Params> {
    state!: State;
};

// A singular route record
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path> | undefined,
> {
    method: Method;
    path: Path;
    handler: Handler;
    validator: Validator;
}

export type BaseRoute = Route<any, any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];
