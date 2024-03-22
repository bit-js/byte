import type { BaseByte } from '..';

import type { Fn } from './handler';
import type { ValidatorRecord } from './validator';

// A singular route record
const emptyList: Fn[] = [];
const doubleSlashRegex = /\/\//g;

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
        const route = new Route(
            this.method, this.path,
            this.handler, this.validator
        );

        // Merge actions and path
        route.actions = app.concatActions(this.actions);
        route.path = (base + this.path).replace(doubleSlashRegex, '/') as Path;

        return route;
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

