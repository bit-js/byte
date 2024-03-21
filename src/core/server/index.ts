import Blitz from '@bit-js/blitz';

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
        const Validator extends ValidatorRecord<Path>,
        const Handler extends BaseHandler<Path, InferValidator<Validator>>,
    >(path: Path, validator: Validator, ...handlers: [...Fn[], Handler]): Byte<[...T, Route<Method, Path, Handler, Validator>]>
    <
        const Path extends string,
        const Handler extends BaseHandler<Path>,
    >(path: Path, ...handlers: [...Fn[], Handler]): Byte<[...T, Route<Method, Path, Handler, null>]>
};

type HandlerRegisters<T extends RoutesRecord> = {
    [Method in RequestMethod | 'any']: Register<Method, T>;
};

type NormalizeEnd<T extends string> = T extends '/' ? '/' : (T extends `${infer Start}/` ? Start : T);
type NormalizePath<T extends string> = NormalizeEnd<T extends `${infer Start}//${infer End}` ? `${Start}/${End}` : T>;

type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [Omit<Current, 'path'> & { path: NormalizePath<`${Base}${Current['path']}`> }, ...SetBase<Base, Rest>]
    : [];

const doubleSlashRegex = /\/\//g;

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
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
    #concatActions(actions: BaseRoute['actions']) {
        return actions.length === 0 ? this.actions : this.actions.concat(actions);
    }

    /**
     * Register subroutes
     */
    route<Path extends string, App extends BaseByte>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, App['routes']>]> {
        const { routes } = app;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];

            this.routes.push({
                // Basically copy
                handler: route.handler,
                method: route.method,
                validator: route.validator,

                // Concat and normalize
                path: (base + route.path).replace(doubleSlashRegex, '/'),

                // Get all actions
                actions: app.#concatActions(route.actions)
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
            const handler = compileRoute(route, this.#concatActions(route.actions));

            if (route.method === '$')
                this.router.handle(route.path, handler);
            else
                this.router.put(route.method, route.path, handler);
        }

        return this.router.build(Context);
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

        this.routes.push({
            handler: args[lastIdx],
            actions: args.slice(startIdx, lastIdx),
            validator: startIdx === 1 ? args[0] : null,

            path, method,
        });

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
