import Blitz, { BaseRouter } from '@bit-js/blitz';

import type { ProtoSchema, RequestMethod } from '../utils/methods';

import { Route, type BaseRoute, type RoutesRecord } from './route';
import type { InferValidatorRecord, ValidatorRecord } from './types/validator';
import { Context, type BaseHandler, type Fn } from './types/handler';

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
        handler: Handler
    ): Byte<[...T, Route<Method, Path, Validator, Handler>]>;

    <
        const Path extends string,
        const Handler extends BaseHandler<Path>,
    >(
        path: Path,
        handlers: Handler
    ): Byte<[...T, Route<Method, Path, null, Handler>]>;
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
export class Byte<Rec extends RoutesRecord = []> implements ProtoSchema {
    readonly actions: Fn[] = [];

    /**
     * Run before validation
     */
    use(...fns: Fn[]) {
        this.actions.push(...fns);
        return this;
    }

    /**
     * Register plugins
     */
    register(...plugin: Plugin[]) {
        for (let i = 0, { length } = plugin; i < length; ++i)
            plugin[i].plug(this);

        return this;
    }

    /**
     * Routes record
     */
    readonly routes: BaseRoute[] = [];

    /**
     * Register subroutes
     */
    route(base: string, { routes, actions }: BaseByte) {
        const currentRoutes = this.routes;
        for (let i = 0, { length } = routes; i < length; ++i)
            currentRoutes.push(routes[i].clone(base, actions));

        return this;
    }

    #fetch?: any;

    /**
     * Build the fetch function
     */
    build(router: BaseRouter = new Blitz()) {
        const { routes } = this;

        for (let i = 0, { length } = routes; i < length; ++i)
            routes[i].register(router);

        return this.#fetch = router.build(Context);
    }

    /**
     * Get the fetch function for use
     */
    get fetch(): (req: Request) => any {
        return this.#fetch ??= this.build();
    }

    /**
     * Create a test client
     */
    client() {
        return bit<this>('http://127.0.0.1', this);
    }

    /**
     * Register a handler
     */
    handle(method: string, path: string, ...args: any[]) {
        // Load necessary actions
        const { actions } = this;

        // Push new route
        this.routes.push(
            typeof args[0] === 'function'
                ? new Route(
                    method, path,
                    // Check for validator
                    null, args[0],
                    // Load the actions
                    actions.length === 0 ? [] : [actions]
                )
                : new Route(
                    method, path,
                    // Check for validator
                    args[0], args[1],
                    // Load the actions
                    actions.length === 0 ? [] : [actions]
                )
        );

        return this;
    }

    /**
     * Create a validator
     */
    static state<const T extends ValidatorRecord>(validator: T) {
        return validator;
    }

    /**
     * Create a handler
     */
    static handle<const T extends Fn>(fn: T) {
        return fn;
    }

    /**
     * Create a plugin
     */
    static plugin(plugin: Plugin) {
        return plugin;
    }

    /**
     * Shorthand for registering subroutes
     */
    static route(base: string, app: BaseByte): Byte {
        return new Byte().route(base, app);
    }

    /** @internal */
    // @ts-ignore
    get(...args: any[]): any {
        // @ts-ignore
        return this.handle('GET', ...args);
    }
    /** @internal */
    // @ts-ignore
    head(...args: any[]): any {
        // @ts-ignore
        return this.handle('HEAD', ...args);
    }
    /** @internal */
    // @ts-ignore
    post(...args: any[]): any {
        // @ts-ignore
        return this.handle('POST', ...args);
    }
    /** @internal */
    // @ts-ignore
    put(...args: any[]): any {
        // @ts-ignore
        return this.handle('PUT', ...args);
    }
    /** @internal */
    // @ts-ignore
    delete(...args: any[]): any {
        // @ts-ignore
        return this.handle('DELETE', ...args);
    }
    /** @internal */
    // @ts-ignore
    options(...args: any[]): any {
        // @ts-ignore
        return this.handle('OPTIONS', ...args);
    }
    /** @internal */
    // @ts-ignore
    any(...args: any[]): any {
        // @ts-ignore
        return this.handle(null, ...args);
    }
}

export interface Byte<Rec> extends HandlerRegisters<Rec> { };

export type BaseByte = Byte<RoutesRecord>;
export type InferByteRecord<T extends BaseByte> = T extends Byte<infer R> ? R : [];

// Types
export * from './route';

export * from './types/handler';
export * from './types/validator';
export * from './types/responseInit';

// Internals and utils
export * from './utils/parsers';
export * from './utils/responses';
export * from './utils/macro';
