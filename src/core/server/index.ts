import Blitz from '@bit-js/blitz';
import type { BaseHandler, RoutesRecord, Route } from './types';
import { type RequestMethod, injectProto } from '../utils/methods';

const allMethod = '$';
type AllMethodType = typeof allMethod;

// Methods to register request handlers
type HandlerRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends string,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler) => Byte<[...T, Route<Method, Path, Handler>]>;
} & {
    any<
        Path extends string,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler): Byte<[...T, Route<AllMethodType, Path, Handler>]>
};

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
    /** 
     * Register a handler for all method
     */
    any(path: string, handler: any) {
        this.routes.push({ path, handler, method: allMethod });

        return this as any;
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
     * Get the fetch function for use
     */
    get fetch() {
        const { routes } = this;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const { method, path, handler } = routes[i];

            if (method === allMethod)
                this.router.handle(path, handler);
            else
                this.router.put(method, path, handler);
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
