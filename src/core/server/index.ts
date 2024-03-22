import Blitz from '@bit-js/blitz';

import {
    type BaseHandler, type RoutesRecord, Route,
    type InferValidatorRecord, type ValidatorRecord,
    type Fn, type Plugin, type SetBase, type ActionList, Context
} from './types';

import { type RequestMethod, injectProto } from '../utils/methods';

import compileRoute from './utils/compile/route';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord> {
    <
        const Path extends string,
        const Validator extends ValidatorRecord<Path>,
        const Handler extends BaseHandler<Path, InferValidatorRecord<Validator>>,
    >(
        path: Path,
        validator: Validator,
        ...handlers: [...ActionList<Path, InferValidatorRecord<Validator>>, Handler]
    ): Byte<[...T, Route<Method, Path, Handler, Validator>]>;

    <
        const Path extends string,
        const Handler extends BaseHandler<Path>,
    >(
        path: Path,
        ...handlers: [...ActionList<Path>, Handler]
    ): Byte<[...T, Route<Method, Path, Handler, null>]>;
};

type HandlerRegisters<T extends RoutesRecord> = {
    [Method in RequestMethod | 'any']: Register<Method, T>;
};

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
    concatActions(actions: Fn[]) {
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
     * Build the fetch function
     */
    rebuild() {
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

        // Cache the value
        const value = router.build(Context);
        Object.defineProperty(this, 'fetch', { value, writable: false });

        return value;
    }

    /**
     * Get the fetch function for use
     */
    get fetch() {
        return this.rebuild();
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

        const route = new Route(method, path, args[lastIdx]);

        if (startIdx !== lastIdx)
            route.actions = args.slice(startIdx, lastIdx);
        if (startIdx === 1)
            route.validator = args[0];

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
