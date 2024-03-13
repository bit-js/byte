import Blitz, { type ContextOptions, extendContext } from '@bit-js/blitz';

import {
    type BaseHandler, type RoutesRecord, type Route, type BaseRoute,
    type InferValidator, type ValidatorRecord, Context, type Fn, type Plugin
} from './types';

import { type RequestMethod, injectProto } from '../utils/methods';
import compileRoute from './utils/compile/route';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord> {
    <
        const Path extends string,
        const Validator extends ValidatorRecord<Path> | undefined,
        const Handler extends BaseHandler<Path, InferValidator<Validator>>,
    >(path: Path, validator: Validator, handler: Handler): Byte<[...T, Route<Method, Path, Handler, Validator>]>
    <
        const Path extends string,
        const Handler extends BaseHandler<Path>,
    >(path: Path, handler: Handler): Byte<[...T, Route<Method, Path, Handler, undefined>]>
};

type HandlerRegisters<T extends RoutesRecord> = {
    [Method in RequestMethod | 'any']: Register<Method, T>;
};

type NormalizeEnd<T extends string> = T extends '/' ? '/' : (T extends `${infer Start}/` ? Start : T);
type NormalizePath<T extends string> = NormalizeEnd<T extends `${infer Start}//${infer End}` ? `${Start}/${End}` : T>;

type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [Omit<Current, 'path'> & { path: NormalizePath<`${Base}${Current['path']}`> }, ...SetBase<Base, Rest>]
    : [];

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
    readonly contextOptions: ContextOptions = { headers: {} };

    readonly actions: Fn[] = [];

    /**
     * Run before validation
     */
    action(...fns: Fn[]): this {
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
    getActions(route: BaseRoute) {
        return this.actions.concat(route.actions);
    }

    /**
     * Register subroutes
     */
    route<Path extends string, App extends Byte<any>>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, App['routes']>]> {
        const { routes } = app;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];

            this.routes.push({
                // Basically copy
                handler: route.handler,
                method: route.method,
                validator: route.validator,

                // Concat path
                path: (base + route.path).replace('//', '/'),

                // Get all actions
                actions: app.getActions(route)
            });
        }

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
        const { routes } = this;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];
            // Compile the handler before adding to the router
            const handler = compileRoute(route, this.getActions(routes[i]));

            if (route.method === '$')
                this.router.handle(route.path, handler);
            else
                this.router.put(route.method, route.path, handler);
        }

        return this.router.build(extendContext(Context, this.contextOptions));
    }
}

export interface Byte<Record> extends HandlerRegisters<Record> { };

function createMethodRegister(method: string) {
    return function(this: Byte<any>, path: string, ...args: any[]) {
        const handler = args.length === 1 ? args[0] : args[1];
        const validator = args.length === 2 ? args[0] : undefined;

        this.routes.push({ path, handler, method, validator, actions: [] });
        return this;
    }
};
injectProto(Byte, createMethodRegister);
Byte.prototype.any = createMethodRegister('$');

// Other neccessary stuff
export * from './types';

export * from './utils/parsers';
export * from './utils/responses';
export * from './utils/query';
export * from './utils/macro';
