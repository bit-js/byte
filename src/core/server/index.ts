import Blitz, { BaseRouter } from '@bit-js/blitz';

import { type RequestMethod } from '../utils/methods';

import { Route, type BaseRoute, type RoutesRecord, type SetBase } from './route';
import type { InferValidatorRecord, ValidatorRecord } from './types/validator';
import { Context, type ActionList, type BaseHandler, type Fn } from './types/handler';

import { bit } from '../client';
import ServerProto from './utils/serverProto';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord> {
    <
        const Path extends string,
        const Validator extends ValidatorRecord<Path>,
        const Handler extends BaseHandler<Path, InferValidatorRecord<Validator>>,
    >(
        path: Path,
        validator: Validator,
        ...handlers: [...ActionList<Path>, Handler]
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
export class Byte<Record extends RoutesRecord = []> extends ServerProto {
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
    route<
        Path extends string,
        App extends BaseByte
    >(base: Path, { routes, actions }: App): Byte<[...Record, ...SetBase<Path, InferByteRecord<App>>]> {
        const currentRoutes = this.routes;

        for (let i = 0, { length } = routes; i < length; ++i)
            currentRoutes.push(routes[i].clone(base, actions));

        return this as any;
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
        // If first arg is a handler
        const actionStartIdx = typeof args[0] === 'function' ? 0 : 1;
        const handlerIdx = args.length - 1;

        // Load necessary actions
        const { actions } = this;

        // Push new route
        this.routes.push(
            new Route(
                method, path, args[handlerIdx],
                // Check for validator
                actionStartIdx === 1 ? args[0] : null,
                // Load the actions
                actions.length === 0
                    ? (actionStartIdx === handlerIdx ? [] : [args.slice(actionStartIdx, handlerIdx)])
                    : (actionStartIdx === handlerIdx ? [actions] : [actions, args.slice(actionStartIdx, handlerIdx)])
            )
        );

        return this;
    }

    /**
     * Create a validator
     */
    static validate<const T extends ValidatorRecord>(validator: T) {
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
}

// @ts-expect-error Declarations of proto will be stripped
export interface Byte<Record> extends HandlerRegisters<Record> { };

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
