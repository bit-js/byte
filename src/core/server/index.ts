import Blitz, { BaseRouter } from '@bit-js/blitz';

import type { ProtoSchema, RequestMethod } from '../utils/methods';

import { Route, type RoutesRecord, type ActionList } from './route';
import { Context, type BaseHandler, type DeferFn, type Fn } from './types/handler';

import { bit } from '../client';
import { default404, emptyList } from '../../utils/defaultOptions';
import type { AwaitedReturn } from '../utils/types';
import type { GenericResponse } from './utils/responses';
import type { BasePlugin, InferPluginState } from './types/plugin';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord, State> {
    <
        const Path extends string,
        const Handler extends BaseHandler<Path, State>,
    >(
        path: Path,
        handler: Handler
    ): Byte<[...T, Route<Method, Path, Handler>], State>;

    <
        const Path extends string,
        const Handler extends BaseHandler<Path, State>,
    >(
        path: Path,
        handlers: Handler
    ): Byte<[...T, Route<Method, Path, Handler>], State>;
};

type HandlerRegisters<T extends RoutesRecord, State> = {
    [Method in RequestMethod | 'any']: Register<Method, T, State>;
};

/**
 * Create a Byte app
 */
export class Byte<Rec extends RoutesRecord = [], State = {}> implements ProtoSchema {
    readonly actions: ActionList<State> = [];
    readonly defers: DeferFn<State>[] = [];

    /**
     * Register middlewares that doesn't require validations
     */
    pass(...fns: Fn<State>[]) {
        this.actions.push([1, fns]);
        return this;
    }

    /**
     * Register middlewares
     */
    use(...fns: Fn<State>[]) {
        this.actions.push([2, fns]);
        return this;
    }

    /**
     * Bind a prop to the context
     */
    set<Name extends string, Getter extends Fn<State>>(name: Name, fn: Getter) {
        this.actions.push([3, fn, name]);
        return this as Byte<Rec, State & { [K in Name]: AwaitedReturn<Getter> }>;
    }

    /**
     * Bind a prop to the context
     */
    validate<Name extends string, Getter extends Fn<State>>(name: Name, fn: Getter) {
        this.actions.push([4, fn, name]);
        return this as Byte<Rec, State & { [K in Name]: Exclude<AwaitedReturn<Getter>, GenericResponse> }>;
    }

    /**
     * Run after response handler
     */
    defer(...fns: DeferFn<State>[]) {
        this.defers.push(...fns);
        return this;
    }

    /**
     * Register plugins
     */
    register<Plugins extends BasePlugin[]>(...plugins: Plugins) {
        for (let i = 0, { length } = plugins; i < length; ++i)
            // @ts-ignore
            plugins[i].plug(this);

        return this as Byte<Rec, State & InferPluginState<Plugins>>;
    }

    /**
     * Routes record. Only use this to infer types
     */
    readonly routes: Rec = [] as any;

    /**
     * Register sub-routes
     */
    route<T extends BaseByte>(base: string, { routes }: T) {
        const currentRoutes = this.routes;
        const { actions, defers } = this;

        for (let i = 0, { length } = routes; i < length; ++i)
            currentRoutes.push(routes[i].clone(base, actions, defers));

        return this;
    }

    #fetch?: any;

    /**
     * Build the fetch function
     */
    build(router: BaseRouter = new Blitz()) {
        const { routes } = this;
        router.fallback = default404;

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
     * Create a handler
     */
    static handle<const T extends Fn<{}>>(fn: T) {
        return fn;
    }

    /**
     * Create an defer handler
     */
    static defer<const T extends DeferFn<{}>>(fn: T) {
        return fn;
    }

    /**
     * Create a plugin
     */
    static plugin<const Plugin extends BasePlugin>(plugin: Plugin) {
        return plugin;
    }

    /**
     * Shorthand for registering subroutes
     */
    static route<T extends BaseByte>(base: string, app: T) {
        return new Byte().route(base, app) as Byte;
    }

    /**
    * Register a handler
    */
    handle(method: string, path: string, ...args: any[]) {
        // Load necessary actions
        const { actions, defers } = this;

        // Push new route
        this.routes.push(
            new Route(
                method, path,
                // Check for validator
                args[0],
                // Load the actions and alters
                actions.length === 0 ? emptyList : [actions],
                defers.length === 0 ? emptyList : [defers]
            )
        );

        return this;
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

export interface Byte<Rec, State> extends HandlerRegisters<Rec, State> { };

export type BaseByte = Byte<RoutesRecord, any>;

// Real stuff
export * from './route';

// Types
export * from './types/plugin';
export * from './types/handler';
export * from './types/responseInit';

// Internals and utils
export * from './utils/responses';
export * from './utils/macro';
