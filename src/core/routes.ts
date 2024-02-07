import type Byte from '..';

import type { Handler } from './types';
import type { RequestMethod } from './method';
import type { AwaitedReturn } from './utils/types';

// Routes
export interface Route {
    path: string,
    method: string,
    handler: Handler,
    vld?: Validator
}

export type RoutesRecord = Route[];

// Validator
export type PredefinedValidators = ('body' | 'query') & {};

export type Validator<Path extends string = any> = {
    [K in PredefinedValidators]?: Handler<Path>
}

// Get validator body
export type ValidatorValue<T extends Validator | undefined, Prop extends string> =
    (T & {}) extends { [K in Prop]: infer F extends Handler } ? AwaitedReturn<F> : never;

export type InferValidator<T extends Validator> = {
    [K in keyof T]: AwaitedReturn<T[K]>;
};

// Register handler methods (get, post, put, ...)
export type HandlerRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends string,
        Fn extends Handler<Path>,
    >(path: Path, handler: Fn) => Byte<[...T, {
        path: Path,
        method: Method,
        handler: Fn
    }]>;
}

// Register handler methods with validators (get, post, put, ...)
export type ValidatorRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends string,
        Vld extends Validator,
        Fn extends Handler<Path, InferValidator<Vld>>,
    >(path: Path, vld: Vld, handler: Fn) => Byte<[...T, {
        path: Path,
        method: Method,
        handler: Fn,
        vld: Vld
    }]>;
}

export type Register<T extends RoutesRecord> = HandlerRegister<T> & ValidatorRegister<T>;
