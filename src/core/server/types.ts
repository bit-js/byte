import { Context as BaseContext, type Params } from '@bit-js/blitz';

export type BaseHandler<Path extends string> = (c: Context<Params<Path>>) => Response | Promise<Response>;
export type Fn = (c: Context<any>) => any;

export type BaseValidator<Path extends string> = (c: Context<Params<Path>>) => any;
export type ValidatorRecord = Record<string, Fn>;

export class Context<Params> extends BaseContext<Params> { };

// A singular route record
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends BaseHandler<Path>,
    Validator extends ValidatorRecord | undefined,
> {
    method: Method;
    path: Path;
    handler: Handler;
    validator: Validator;
}

export type BaseRoute = Route<any, any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];
