import { Context as BaseContext, type Params } from '@bit-js/blitz';

export type BaseHandler<Path extends string> = (c: Context<Params<Path>>) => Response | Promise<Response>;
export class Context<Params> extends BaseContext<Params> { };

// A singular route record
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends BaseHandler<Path>
> {
    method: Method;
    path: Path;
    handler: Handler;
}

export type BaseRoute = Route<any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];
