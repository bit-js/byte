import Blitz from '@bit-js/blitz';

import { type RequestMethod, injectProto } from '../utils/methods';

import compileRoute from './utils/compile/route';

import { Route, type RoutesRecord, type SetBase } from './types/route';
import type { InferValidatorRecord, ValidatorRecord } from './types/validator';
import { Context, type ActionList, type BaseHandler, type Fn } from './types/handler';

import { bit } from '../client';

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
 * A plugin
 */
export interface Plugin {
    plug(app: BaseByte): any;
}

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
     * Overwrite a getter with a cached non-writable value
     */
    private writeGetter<K extends keyof this>(name: K, value: this[K]): this[K] {
        // Cache the last value of the getter
        Object.defineProperty(this, name, { value, writable: false });
        return value;
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

        return this.writeGetter('fetch', router.build(Context));
    }

    /**
     * Get the fetch function for use
     */
    get fetch(): (req: Request) => any {
        return this.rebuild();
    }

    /**
     * Create a test client
     */
    client() {
        return bit<this>('http://127.0.0.1', this.fetch);
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

        const route = new Route(
            method, path, args[lastIdx],
            startIdx === 1 ? args[0] : null
        );

        if (startIdx !== lastIdx)
            route.actions = args.slice(startIdx, lastIdx);

        this.routes.push(route);

        return this;
    }
};
injectProto(Byte, createMethodRegister);
Byte.prototype.any = createMethodRegister('$');

// Types
export * from './types/handler';
export * from './types/route';
export * from './types/validator';

// Internals and utils
export * from './utils/parsers';
export * from './utils/responses';
export * from './utils/macro';
