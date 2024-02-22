import Blitz from '@bit-js/blitz';
import type { BaseHandler, RoutesRecord, Route, BaseRoute, InferValidator, ValidatorRecord } from './types';
import { type RequestMethod, injectProto } from '../utils/methods';
import compileValidator from './compile/validators';

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
    route<Path extends string, App extends Byte<any>>(base: Path, app: App): Byte<[...Record, ...SetBase<Path, App['routes']>]> {
        const { routes } = app;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];

            this.routes.push({
                handler: route.handler, method: route.method,
                validator: route.validator,
                path: (base + route.path).replace('//', '/')
            });
        }

        return this as any;
    }

    /**
     * Get the fetch function for use
     */
    get fetch() {
        const { routes } = this;

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i],
                handler = compileValidator(route.handler, route.validator);

            if (route.method === '$')
                this.router.handle(route.path, handler);
            else
                this.router.put(route.method, route.path, handler);
        }

        return this.router.build();
    }
}

export interface Byte<Record> extends HandlerRegisters<Record> { };

function createMethodRegister(method: string) {
    return function(this: Byte<any>, path: string, ...args: any[]) {
        const handler = args.length === 1 ? args[0] : args[1];
        const validator = args.length === 2 ? args[0] : undefined;

        this.routes.push({ path, handler, method, validator });
        return this;
    }
};

// Init handler register
injectProto(Byte, createMethodRegister);
Byte.prototype.any = createMethodRegister('$');

export * from './types';
export * from './responses';
