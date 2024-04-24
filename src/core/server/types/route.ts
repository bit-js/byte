import type { BaseRouter } from '@bit-js/blitz';
import compileRoute from '../utils/compile/route';

import type { Fn } from './handler';
import type { ValidatorRecord } from './validator';

/**
 * Represent a route
 * @internal
 */
export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    /**
     * Create a route procedure
     */
    constructor(
        readonly method: Method,
        readonly path: Path,
        readonly handler: Handler,
        readonly validator: Validator,
        readonly actions: Fn[][]
    ) { }

    /**
     * Load an action list
     */
    loadActions(list: Fn[]) {
        if (list.length !== 0)
            this.actions.push(list);
    }

    /**
     * Clone the route with a new base path
     */
    clone(base: string, otherAppActions: Fn[]) {
        const { path } = this;

        return new Route(
            this.method,
            // Merge pathname
            base.length === 1 ? path : (path.length === 1 ? base : base + path) as Path,
            // Copy other props
            this.handler, this.validator,
            // Push other stuff
            [otherAppActions, ...this.actions]
        );
    }

    /**
     * Register the handler to the underlying router
     */
    register(router: BaseRouter) {
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

