import { t } from 'wint-js';
import { type RoutesRecord, type HandlerRegister, methods } from './core/methods';
import type { Serve, Wrapper } from './core/types';
import wrap from './core/serializers';

/**
 * Request register
 */
interface Byte<T extends RoutesRecord = []> extends HandlerRegister<T> { };

/**
 * Create a byte application
 */
class Byte<T extends RoutesRecord> {
    /**
     * Internal router
     */
    readonly router: t.FastWint = new t.FastWint;

    /**
     * Routes record
     */
    readonly record: T;

    /**
     * A handler wrapper to override behavior
     */
    wrap: Wrapper;

    constructor(options?: Serve) {
        // Assign serve option
        if (typeof options === 'object')
            for (const key in options)
                // @ts-ignore
                this[key] = options[key];

        this.router = new t.FastWint;
        this.record = [] as any;
        this.wrap = wrap;

        for (const lowerCaseMethod of methods) {
            const method = lowerCaseMethod.toUpperCase();

            this[lowerCaseMethod] = (path, handler) => {
                this.record.push({ path, method, handler });
                return this as any;
            }
        }
    }

    /**
     * Build the fetch function
     */
    fetch = (req: Request): any => {
        for (const route of this.record)
            this.router.put(route.method, route.path, this.wrap(route.handler));

        return (this.fetch = this.router.build().query)(req);
    }
}

export default Byte;
