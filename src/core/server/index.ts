import Blitz, { BaseRouter } from '@bit-js/blitz';

import type { ProtoSchema, RequestMethod } from '../utils/methods';

import { Route, type RoutesRecord } from './route';
import type { InferValidatorRecord, ValidatorRecord } from './types/validator';
import { Context, type BaseHandler, type DeferFn, type Fn } from './types/handler';

import { bit } from '../client';
import { default404, emptyList } from '../../utils/defaultOptions';
import { $pass, $set } from './utils/macro';
import type { AwaitedReturn } from '../utils/types';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord, State> {
    <
        const Path extends string,
        const Validator extends ValidatorRecord<Path>,
        const Handler extends BaseHandler<Path, State, InferValidatorRecord<Validator>>,
    >(
        path: Path,
        validator: Validator,
        handler: Handler
    ): Byte<[...T, Route<Method, Path, Validator, Handler>]>;

    <
        const Path extends string,
        const Handler extends BaseHandler<Path, State>,
    >(
        path: Path,
        handlers: Handler
    ): Byte<[...T, Route<Method, Path, null, Handler>]>;
};

type HandlerRegisters<T extends RoutesRecord, State> = {
    [Method in RequestMethod | 'any']: Register<Method, T, State>;
};

/**
 * A plugin
 */
export abstract class Plugin {
    abstract plug(app: BaseByte): any;
}

/**
 * Create a Byte app
 */
export class Byte<Rec extends RoutesRecord = [], State = {}> implements ProtoSchema {
    readonly actions: Fn<State>[] = [];
    readonly defers: DeferFn<State>[] = [];

    /**
     * Register middlewares
     */
    use(...fns: Fn<State>[]) {
        this.actions.push(...fns);
        return this;
    }

    /**
     * Register middlewares that doesn't require validations
     */
    proc(...fns: Fn<State>[]) {
        this.actions.push(...fns.map($pass));
        return this;
    }

    /**
     * Bind a prop to the context
     */
    set<Name extends string, Getter extends Fn<State>>(name: Name, fn: Getter): Byte<Rec, State & { [K in Name]: AwaitedReturn<Getter> }> {
        this.actions.push($set(name, fn));
        return this as any;
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
    register(...plugin: Plugin[]) {
        for (let i = 0, { length } = plugin; i < length; ++i)
            plugin[i].plug(this);

        return this;
    }

    /**
     * Routes record. Only use this to infer types
     */
    readonly routes: Rec = [] as any;

    /**
     * Register sub-routes
     */
    route(base: string, { routes }: BaseByte) {
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
        router.fallback ??= default404;

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
        const { actions, defers } = this;

        // Push new route
        this.routes.push(
            typeof args[0] === 'function'
                ? new Route(
                    method, path,
                    // Check for validator
                    null, args[0],
                    // Load the actions and alters
                    actions.length === 0 ? emptyList : [actions],
                    defers.length === 0 ? emptyList : [defers]
                )
                : new Route(
                    method, path,
                    // Check for validator
                    args[0], args[1],
                    // Load the actions and alters
                    actions.length === 0 ? emptyList : [actions],
                    defers.length === 0 ? emptyList : [defers]
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
     * Create an alter handler
     */
    static defer<const T extends DeferFn>(fn: T) {
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

export interface Byte<Rec, State> extends HandlerRegisters<Rec, State> { };

export type BaseByte = Byte<RoutesRecord, any>;

// Types
export * from './route';

export * from './types/handler';
export * from './types/validator';
export * from './types/responseInit';

// Internals and utils
export * from './utils/responses';
export * from './utils/macro';
