import type { BaseRouter } from '@bit-js/blitz';
import type { BaseByte } from '..';
import compileRoute from '../utils/compile/route';

import type { Fn } from './handler';
import type { ValidatorRecord } from './validator';

export class RouteActions {
    defers: Fn[][] = [];

    /**
     * Push all actions of the app into a defer list
     */
    defer(actions: Fn[]) {
        if (actions.length !== 0)
            this.defers.push(actions);
    }
}

export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    actions: RouteActions = new RouteActions();

    /**
     * Create a route procedure
     */
    constructor(
        public method: Method,
        public path: Path,
        public handler: Handler,
        public validator: Validator
    ) { }

    /**
     * Clone the route with a new base path
     */
    clone(base: string, app: BaseByte) {
        const { path } = this;

        const route = new Route(
            this.method, base.length === 1 ? path : (path.length === 1 ? base : base + path) as Path,
            this.handler, this.validator
        );
        route.actions.defer(app.actions);

        return route;
    }

    /**
     * Register the handler to the underlying router
     */
    register(app: BaseByte, router: BaseRouter) {
        this.actions.defer(app.actions);

        if (this.method === null)
            router.handle(this.path, compileRoute(this));
        else
            router.put(this.method, this.path, compileRoute(this));
    }
}

export type BaseRoute = Route<any, any, any, any>;

type TrimEndSlash<T extends string> = T extends `${infer Start}/` ? Start : T;
type NormalizePath<T extends string> = T extends '/' ? '/' : TrimEndSlash<T>;

type SetBasePath<T extends BaseRoute, Base extends string> = Omit<T, 'path'> & {
    path: `${NormalizePath<Base>}${TrimEndSlash<T['path']>}`
};

export type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [SetBasePath<Current, Base>, ...SetBase<Base, Rest>]
    : [];

// Route list
export type RoutesRecord = BaseRoute[];

