import Blitz from '@bit-js/blitz';

import {
    type BaseHandler, type RoutesRecord, Route, type BaseRoute,
    type InferValidator, type ValidatorRecord, Context, type Fn, type Plugin
} from './types';

import { type RequestMethod, injectProto } from '../utils/methods';
import compileRoute from './utils/compile/route';

import type { LastItem, BasePath, TrimEnd, Items } from '../utils/types';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord> {
    <
        const Path extends string,
        const Validator extends ValidatorRecord<Path>,
        const Handlers extends Items<BaseHandler<Path, InferValidator<Validator>>>,
    >(path: Path, validator: Validator, ...handlers: Handlers): Byte<[...T, Route<Method, Path, LastItem<Handlers>, Validator>]>
    <
        const Path extends string,
        const Handlers extends Items<BaseHandler<Path>>,
    >(path: Path, ...handlers: Handlers): Byte<[...T, Route<Method, Path, LastItem<Handlers>, null>]>
};

type HandlerRegisters<T extends RoutesRecord> = {
    [Method in RequestMethod | 'any']: Register<Method, T>;
};

type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [Current & { path: `${BasePath<Base>}${TrimEnd<Current['path']>}` }, ...SetBase<Base, Rest>]
    : [];

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
    readonly actions: Fn[] = [];

    /**
     * Run before validation
     */
    action(...fns: Fn[]) {
        this.actions.push(...fns);
        return this;
    }

    /**
     * Register plugins
     */
    use(...plugin: Plugin[]) {
        for (let i = 0, { length } = plugin; i < length; ++i)
            plugin[i].plug(this);

        return this;
    }

    /**
     * Routes record
     */
    readonly routes: Record = [] as any;

    /**
     * Internal router
     */
    readonly router: Blitz = new Blitz();

    /**
     * Get actions
     */
    concatActions(actions: BaseRoute['actions']) {
        return actions.length === 0 ? this.actions : this.actions.concat(actions);
    }

    /**
     * Register subroutes
     */
    route<Path extends string, App extends BaseByte>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, App['routes']>]> {
        const { routes } = app;
        const currentRoutes = this.routes;

        for (let i = 0, { length } = routes; i < length; ++i)
            currentRoutes.push(routes[i].clone(base, app));

        return this as any;
    }

    /**
     * Fallback if the router cannot find a matching route handler
     */
    fallback(f: Fn) {
        // @ts-expect-error Context does not match
        this.router.fallback = f;
    }

    /**
     * Get the fetch function for use
     */
    get fetch() {
        const { routes, router } = this;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];
            // Compile the handler before adding to the router
            const handler = compileRoute(route, this.concatActions(route.actions));

            if (route.method === '$')
                router.handle(route.path, handler);
            else
                router.put(route.method, route.path, handler);
        }

        return router.build(Context);
    }
}

export interface Byte<Record> extends HandlerRegisters<Record> { };
export type BaseByte = Byte<RoutesRecord>;

// Register method handler registers
function createMethodRegister(method: string): any {
    return function(this: BaseByte, path: string, ...args: any[]) {
        // If first arg is a handler
        const startIdx = typeof args[0] === 'function' ? 0 : 1;
        const lastIdx = args.length - 1;

        const route = new Route();

        if (startIdx !== lastIdx)
            route.actions = args.slice(startIdx, lastIdx);
        if (startIdx === 1)
            route.validator = args[0];

        // Set other required props
        route.handler = args[lastIdx];
        route.path = path;
        route.method = method;

        this.routes.push(route);

        return this;
    }
};
injectProto(Byte, createMethodRegister);
Byte.prototype.any = createMethodRegister('$');

// Other neccessary stuff
export * from './types';

export * from './utils/csrf';
export * from './utils/cors';
export * from './utils/parsers';
export * from './utils/responses';
export * from './utils/query';
export * from './utils/macro';
