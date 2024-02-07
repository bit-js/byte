import { t } from 'wint-js';

import { type RoutesRecord, type Register } from './core/routes';
import type { Serve, Wrapper } from './core/types';
import wrap from './core/serializers';
import { methods } from './core/method';
import compileValidator from './core/utils/compileValidator';

/**
 * Request register
 */
interface Byte<T extends RoutesRecord = []> extends Register<T> { };

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
    wrapper: Wrapper;

    constructor(options?: Serve) {
        // Assign serve option
        if (typeof options === 'object')
            for (const key in options)
                // @ts-ignore
                this[key] = options[key];

        this.router = new t.FastWint;
        this.record = [] as any;
        this.wrapper = wrap;

        for (const lowerCaseMethod of methods) {
            const method = lowerCaseMethod.toUpperCase();

            this[lowerCaseMethod] = (path: any, ...args: any[]) => {
                const rec: any = { path, method };
                // Only handler
                if (args.length === 1)
                    rec.handler = args[0];
                // Handler with validator
                else {
                    rec.vld = args[0];
                    rec.handler = args[1];
                }

                this.record.push(rec);
                return this as any;
            }
        }
    }

    /**
     * Wrap all handler with a specific wrapper (auto-response)
     */
    wrap(wrapper: Wrapper) {
        this.wrapper = wrapper;
    }

    /**
     * Build the fetch function
     */
    fetch = (req: Request): any => {
        for (const route of this.record) {
            const fn = this.wrapper(route.handler);

            this.router.put(
                route.method, route.path,
                compileValidator(route.vld, fn)
            );
        }

        return (this.fetch = this.router.build().query)(req);
    }
}

export default Byte;
