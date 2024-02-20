import Blitz from '@bit-js/blitz';
import type { BaseHandler, RoutesRecord, Route, BaseRoute } from './types';
import { type RequestMethod, injectProto } from '../utils/methods';

const allMethod = '$';
type AllMethodType = typeof allMethod;

type PathString = `/${string}`;

// Methods to register request handlers
type HandlerRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends PathString,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler) => Byte<[...T, Route<Method, Path, Handler>]>;
};

type NormalizePath<T extends string> = T extends `${infer Start}//${infer End}` ? `${Start}/${End}` : T;
type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [Omit<Current, 'path'> & { path: NormalizePath<`${Base}${Current['path']}`> }, ...SetBase<Base, Rest>]
    : [];

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
    /**
     * Routes record
     */
    readonly routes: Record = [] as any;

    /**
     * Internal router
     */
    readonly router: Blitz = new Blitz();


    /**
     * Register subroutes
     */
    route<Path extends PathString, App extends Byte<any>>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, App['routes']>]> {
        const { routes } = app;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];

            this.routes.push({
                handler: route.handler, method: route.method,
                path: (base + route.path).replace('//', '/')
            });
        }

        return this as any;
    }

    /** 
     * Register a handler for all method
     */
    any<
        Path extends PathString,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler): Byte<[...Record, Route<AllMethodType, Path, Handler>]> {
        this.routes.push({ path, handler, method: allMethod });
        return this as any;
    }

    /**
     * Get the fetch function for use
     */
    get fetch() {
        const { routes } = this;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];

            if (route.method === allMethod)
                this.router.handle(route.path, route.handler);
            else
                this.router.put(route.method, route.path, route.handler);
        }

        return this.router.build();
    }
}

// Init handler register
export interface Byte<Record> extends HandlerRegister<Record> { };

injectProto(Byte, method => function(this: Byte<any>, path: string, handler: any) {
    this.routes.push({ path, handler, method });
    return this;
});

export * from './types';
export * from './responses';
