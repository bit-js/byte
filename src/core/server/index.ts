import Blitz from '@bit-js/blitz';

import { type RequestMethod } from '../utils/methods';

import { Route, type BaseRoute, type RoutesRecord, type SetBase } from './types/route';
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
export class Byte<Record extends RoutesRecord = []> extends ServerProto {
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
    readonly routes: BaseRoute[] = [];

    /**
     * Get actions
     */
    concatActions(actions: Fn[]) {
        return actions.length === 0 ? this.actions : this.actions.concat(actions);
    }

    /**
     * Register subroutes
     */
    route<Path extends string, App extends BaseByte>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, InferByteRecord<App>>]> {
        const { routes } = app;
        const currentRoutes = this.routes;

        for (let i = 0, { length } = routes; i < length; ++i)
            currentRoutes.push(routes[i].clone(base, app));

        return this as any;
    }

    fallback?: Fn;
    #fetch?: any;
    /**
     * Build the fetch function
     */
    rebuild() {
        const { routes } = this;
        const router = new Blitz();

        if (typeof this.fallback === 'function')
            router.fallback = this.fallback as any;

        for (let i = 0, { length } = routes; i < length; ++i)
            routes[i].register(this, router);

        return this.#fetch = router.build(Context);
    }

    /**
     * Get the fetch function for use
     */
    get fetch(): (req: Request) => any {
        return this.#fetch ??= this.rebuild();
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
}

// @ts-expect-error Declarations of proto will be stripped
export interface Byte<Record> extends HandlerRegisters<Record> { };

export type BaseByte = Byte<RoutesRecord>;
export type InferByteRecord<T extends BaseByte> = T extends Byte<infer R> ? R : [];

// Types
export * from './types/handler';
export * from './types/route';
export * from './types/validator';
export * from './types/responseInit';

// Internals and utils
export * from './utils/parsers';
export * from './utils/responses';
export * from './utils/macro';
