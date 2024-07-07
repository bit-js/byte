import type { BaseRouter } from '@bit-js/blitz';

import type { DeferFn, Fn } from './types/handler';

import { getPropOfSetter, getPropOfState, isAsync, passChecks } from './utils/macro';

/**
 * Represent a route
 */
export class Route<
    Method extends string,
    Path extends string,
    Handler extends Fn<any>
> {
    /**
     * Create a route procedure
     */
    constructor(
        readonly method: Method,
        readonly path: Path,
        readonly handler: Handler,
        readonly actions: Fn[][],
        readonly defers: DeferFn[][]
    ) { }

    /**
     * Clone the route with a new base path
     */
    clone(base: string, otherAppActions: Fn[], otherAppDefers: DeferFn[]) {
        const { path } = this;

        return new Route(
            this.method,
            // Merge pathname
            base.length === 1 ? path : (path.length === 1 ? base : base + path) as Path,
            // Copy other props
            this.handler,
            // Push other stuff
            otherAppActions.length === 0 ? this.actions : [otherAppActions, ...this.actions],
            otherAppDefers.length === 0 ? this.defers : [...this.defers, otherAppDefers]
        );
    }

    /**
     * Register the handler to the underlying router
     */
    register(router: BaseRouter) {
        if (this.method === null)
            router.handle(this.path, this.compile());
        else
            router.on(this.method, this.path, this.compile());
    }

    /**
     * Compile the route into a single function
     *
     */
    compile() {
        const { handler, actions, defers } = this;

        // Conditions
        const noActions = actions.length === 0;
        const noDefers = defers.length === 0;

        if (noActions && noDefers) return handler;

        const keys = [];
        const statements = [];
        const values = [];

        let hasAsync = false;
        let noContext = true;
        let idx = 0;

        // Compile actions and check result
        if (!noActions)
            // Loop in reverse each app action
            for (let i = 0, { length } = actions; i < length; ++i) {
                const list = actions[i];

                for (let i = 0, { length } = list; i < length; ++i) {
                    const fn = list[i];
                    const fnKey = 'f' + idx;

                    keys.push(fnKey);
                    values.push(fn);

                    const fnAsync = isAsync(fn);
                    hasAsync = hasAsync || fnAsync;

                    const fnNoContext = fn.length === 0;
                    noContext = noContext && fnNoContext;

                    const result = `${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`;

                    // If this handler sets a request prop
                    const setterProp = getPropOfSetter(fn);
                    const stateSetterProp = getPropOfState(fn);

                    if (typeof setterProp === 'string')
                        statements.push(`c.${setterProp}=${result};`);
                    else if (typeof stateSetterProp === 'string')
                        statements.push(`const t${idx}=${result};if(t${idx} instanceof Response)return t${idx};c.${stateSetterProp}=t${idx};`)
                    // If this handler doesn't require checks
                    else if (passChecks(fn))
                        statements.push(result);
                    else {
                        const valKey = `c${idx}`;
                        statements.push(`const ${valKey}=${result};if(${valKey} instanceof Response)return ${valKey}`);
                    }

                    ++idx;
                }
            }

        // Restricted variable for the main handler
        keys.push('$');
        values.push(handler);

        const handlerNoContext = handler.length === 0;
        noContext = noContext && handlerNoContext;

        // Check for alters
        if (noDefers)
            // Save some milliseconds if the function is async
            statements.push(`return ${isAsync(handler) && hasAsync ? 'await ' : ''}$(${handlerNoContext ? '' : 'c'});`);
        else {
            const fnAsync = isAsync(handler);
            hasAsync = hasAsync || fnAsync;

            // Hold a ref to the context
            statements.push(`c.res=${fnAsync ? 'await ' : ''}$(${handlerNoContext ? '' : 'c'})`);

            for (let i = 0, { length } = defers; i < length; ++i) {
                const list = defers[i];

                for (let i = list.length - 1; i > -1; --i) {
                    const fn = list[i];
                    const fnKey = `f${idx}`;

                    keys.push(fnKey);
                    values.push(fn);

                    const fnAsync = isAsync(fn);
                    hasAsync = hasAsync || fnAsync;

                    const fnNoContext = fn.length === 0;
                    noContext = noContext && fnNoContext;

                    statements.push(`${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`);
                    ++idx;
                }
            }

            statements.push('return c.res;');
        }

        return Function(...keys, `return ${hasAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
    }
}

export type BaseRoute = Route<any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];

