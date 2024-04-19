import type { BaseRouter } from '@bit-js/blitz';
import type { BaseByte } from '..';
import compileRoute from '../utils/compile/route';

import type { Fn } from './handler';
import type { ValidatorRecord } from './validator';

// A singular route record
const emptyList: Fn[] = [];

export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    actions: Fn[] = emptyList;

    constructor(
        public method: Method,
        public path: Path,
        public handler: Handler,
        public validator: Validator
    ) { }

    clone(base: string, app: BaseByte) {
        const { path } = this;

        const route = new Route(
            this.method, base.length < 1 ? path : (path.length < 2 ? base : base + path) as Path,
            this.handler, this.validator
        );

        app.concatActions(route);
        return route;
    }

    register(app: BaseByte, router: BaseRouter) {
        app.concatActions(this);
        const handler = compileRoute(this);

        if (this.method === null)
            router.handle(this.path, handler);
        else
            router.put(this.method, this.path, handler);
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

