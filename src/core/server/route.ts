import type { BaseRouter } from '@bit-js/blitz';

import type { Fn } from './types/handler';
import type { ValidatorRecord } from './types/validator';

import { isAsync, passChecks } from './utils/macro';

/**
 * Represent a route
 * @internal
 */
export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn,
    Validator extends ValidatorRecord<Path>,
> {
    /**
     * Create a route procedure
     */
    constructor(
        readonly method: Method,
        readonly path: Path,
        readonly handler: Handler,
        readonly validator: Validator,
        readonly actions: Fn[][]
    ) { }

    /**
     * Load an action list
     */
    loadActions(list: Fn[]) {
        if (list.length !== 0)
            this.actions.push(list);
    }

    /**
     * Clone the route with a new base path
     */
    clone(base: string, otherAppActions: Fn[]) {
        const { path } = this;

        return new Route(
            this.method,
            // Merge pathname
            base.length === 1 ? path : (path.length === 1 ? base : base + path) as Path,
            // Copy other props
            this.handler, this.validator,
            // Push other stuff
            [otherAppActions, ...this.actions]
        );
    }

    /**
     * Register the handler to the underlying router
     */
    register(router: BaseRouter) {
        if (this.method === null)
            router.handle(this.path, this.compile());
        else
            router.put(this.method, this.path, this.compile());
    }

    /**
     * Compile the route into a single function
     */
    compile() {
        const { handler, validator, actions } = this;

        // Conditions
        const noDefer = actions.length === 0;
        const noValidator = validator === null;

        if (noValidator && noDefer) return handler;

        const keys = [], statements = [],
            values = [], paramsKeys = [];

        let hasAsync = false, noContext = true, idx = 0;

        // Compile actions and check result
        if (!noDefer)
            // Loop in reverse each app action
            for (let i = actions.length - 1; i > -1; --i) {
                const list = actions[i];

                for (let i = 0, { length } = list; i < length; ++i) {
                    const fn = list[i];
                    const fnKey = `f${idx}`;

                    keys.push(fnKey);
                    values.push(fn);

                    const fnAsync = isAsync(fn);
                    hasAsync = hasAsync || fnAsync;

                    const fnNoContext = fn.length === 0;
                    noContext = noContext && fnNoContext;

                    const result = `${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`;
                    if (passChecks(fn)) {
                        statements.push(result);
                        continue;
                    }

                    const valKey = `c${idx}`;
                    statements.push(`const ${valKey}=${result};if(${valKey} instanceof Response)return ${valKey}`);

                    ++idx;
                }
            }

        // Compile validators and check result
        if (!noValidator) {
            for (const key in validator) {
                // Validators
                const fn = validator[key], fnKey = 'f' + idx;

                keys.push(fnKey);
                values.push(fn);

                const fnAsync = isAsync(fn);
                hasAsync = hasAsync || fnAsync;

                const fnNoContext = fn.length === 0;
                noContext = noContext && fnNoContext;

                const result = `${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`;
                if (passChecks(fn)) {
                    paramsKeys.push(`${key}:${result}`);
                    continue;
                }

                paramsKeys.push(key);
                statements.push(`const ${key}=${result};if(${key} instanceof Response)return ${key}`);

                ++idx;
            }

            // Set state
            statements.push(`c.state={${paramsKeys.join()}}`);
        }

        // Restricted variable for the main handler
        keys.push('$');
        values.push(handler);

        const fnNoContext = handler.length === 0;
        noContext = noContext && fnNoContext;

        // Save some milliseconds if the function is async
        statements.push(`return ${isAsync(handler) && hasAsync ? 'await ' : ''}$(${fnNoContext ? '' : 'c'})`);

        // Build the function
        return Function(...keys, `return ${hasAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
    }
}

export type BaseRoute = Route<any, any, any, any>;

type TrimEndSlash<T extends string> = T extends `${infer Start}/` ? Start : T;
type NormalizePath<T extends string> = T extends '/' ? '/' : TrimEndSlash<T>;

type SetBasePath<T extends BaseRoute, Base extends string> = Omit<T, 'path'> & {
    path: `${NormalizePath<Base>}${TrimEndSlash<T['path']>}`
};

export type SetBase<Base extends string, T extends RoutesRecord> = T extends [infer Current extends BaseRoute, ...infer Rest extends RoutesRecord]
    ? [SetBasePath<Current, Base>, ...SetBase<Base, Rest>]
    : [];

// Route list
export type RoutesRecord = BaseRoute[];

