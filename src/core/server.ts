import Blitz from '@bit-js/blitz';
import { Context as BaseContext, type Params } from '@bit-js/blitz';

// Request methods
export const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
export type RequestMethod = typeof methods[number];

export type BaseHandler<Path extends string> = (c: Context<Params<Path>>) => any;

export interface Context<Params> extends BaseContext<Params> { };

// A singular route record
export interface Route<
    Method extends string,
    Path extends string,
    Handler extends BaseHandler<Path>
> {
    method: Method;
    path: Path;
    handler: Handler;
}

export type BaseRoute = Route<any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];

// Methods to register request handlers
export type HandlerRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends string,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler) => Byte<[...T, Route<Method, Path, Handler>]>;
} & {
    any<
        Path extends string,
        Handler extends BaseHandler<Path>
    >(path: Path, handler: Handler): Byte<[...T, Route<'$', Path, Handler>]>
};

/**
 * Create a Byte app
 */
export class Byte<Record extends RoutesRecord = []> {
    constructor() {
        for (let i = 0, { length } = methods; i < length; ++i) {
            const method = methods[i].toUpperCase();

            this[methods[i]] = (path, handler) => {
                this.record.push({ path, handler, method });
                return this as any;
            };
        }
    }

    /** 
     * Register a handler for all method
     */
    any(path: string, handler: any) {
        this.record.push({ path, handler, method: null });

        return this as any;
    }

    /**
     * Routes record
     */
    readonly record: Record = [] as any;

    /**
     * Internal router
     */
    readonly router: Blitz = new Blitz();

    /**
     * Get the fetch function for use
     */
    get fetch() {
        const { record } = this;

        for (let i = 0, { length } = record; i < length; ++i) {
            if (record[i].method === null)
                this.router.handle(record[i].path, record[i].handler);
            else
                this.router.put(record[i].method, record[i].path, record[i].handler);
        }

        return this.router.build();
    }
}

export interface Byte<Record> extends HandlerRegister<Record> { };
