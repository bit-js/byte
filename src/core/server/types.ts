import { Context as BaseContext, type Params } from '@bit-js/blitz';

export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => Response | Promise<Response>;

export type BaseValidator<Path extends string> = (c: Context<Params<Path>>) => any;
export type ValidatorRecord<Path extends string> = Record<string, BaseValidator<Path>>;

export type Fn = (c: Context<any, any>) => any;
export type BaseValidatorRecord = Record<string, Fn> | undefined;

type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;
export type ValidatorProp<T, Prop extends string> = { [K in Prop]: ValidatorResult<T> };
export type ValidatorResult<T> = Exclude<AwaitedReturn<T>, Response>;

export type InferValidator<T extends BaseValidatorRecord> = T extends undefined ? undefined : {
    [K in Extract<keyof T, string>]: ValidatorResult<T[K]>;
}

export class Context<Params, State = undefined> extends BaseContext<Params> {
    state!: State;
};

// A singular route record
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends BaseValidatorRecord,
> {
    method: Method;
    path: Path;
    handler: Handler;
    validator: Validator;
}

export type BaseRoute = Route<any, any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];
