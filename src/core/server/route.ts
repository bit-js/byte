import type { BaseRouter } from '@bit-js/blitz';
import type { DeferFn, Fn } from './types/handler';

import { isAsync } from './utils/macro';

// Action
export interface Initializer<State> {
    0: 1;
    1: Fn<State>;
}

export interface Middleware<State> {
    0: 2;
    1: Fn<State>;
}

export interface Setter<State> {
    0: 3;
    1: Fn<State>;
    2: string;
}

export interface StateSetter<State> {
    0: 4;
    1: Fn<State>;
    2: string;
}

export type ActionList<State = any> = (Initializer<State> | Middleware<State> | Setter<State> | StateSetter<State>)[];

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
        readonly actions: ActionList[],
        readonly defers: DeferFn[][]
    ) { }

    /**
     * Clone the route with a new base path
     */
    clone(base: string, otherAppActions: ActionList, otherAppDefers: DeferFn[]) {
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

        const keys: string[] = [];
        const statements: string[] = [];
        const values: (Fn | DeferFn)[] = [];

        let hasAsync = false;
        let noContext = true;
        let idx = 0;

        // Compile actions and check result
        if (!noActions)
            // Loop in reverse each app action
            for (let i = 0, lI = actions.length; i < lI; ++i) {
                const list = actions[i];

                for (let j = 0, lJ = list.length; j < lJ; ++j) {
                    const action = list[j];

                    const fn = action[1];
                    const fnKey = 'f' + idx;

                    keys.push(fnKey);
                    values.push(fn);

                    const fnAsync = isAsync(fn);
                    hasAsync ||= fnAsync;

                    const fnNoContext = fn.length === 0;
                    noContext &&= fnNoContext;

                    ++idx;
                    switch (action[0]) {
                        case 1:
                            statements.push(`${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`);
                            continue;

                        case 2:
                            statements.push(`const c${idx}=${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'});if(c${idx} instanceof Response)return c${idx}`);
                            continue;

                        case 3:
                            statements.push(`c.${action[2]}=${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'})`);
                            continue;

                        case 4:
                            statements.push(`const c${idx}=${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'});if(c${idx} instanceof Response)return c${idx};c.${action[2]}=t${idx}`)
                            continue;
                    }
                }
            }

        // Restricted variable for the main handler
        keys.push('$');
        values.push(handler);

        const handlerNoContext = handler.length === 0;
        noContext &&= handlerNoContext;

        // Check for alters
        if (noDefers)
            // Save some milliseconds if the function is async
            statements.push(`return ${isAsync(handler) && hasAsync ? 'await ' : ''}$(${handlerNoContext ? '' : 'c'});`);
        else {
            const fnAsync = isAsync(handler);
            hasAsync ||= fnAsync;

            // Hold a ref to the context
            statements.push(`const r=${fnAsync ? 'await ' : ''}$(${handlerNoContext ? '' : 'c'})`);

            for (let i = 0, { length } = defers; i < length; ++i) {
                const list = defers[i];

                for (let i = list.length - 1; i > -1; --i) {
                    const fn = list[i];
                    const fnKey = `f${idx}`;

                    keys.push(fnKey);
                    values.push(fn);

                    const fnAsync = isAsync(fn);
                    hasAsync ||= fnAsync;

                    const fnNoContext = fn.length < 2;
                    noContext &&= fnNoContext;

                    statements.push(`const c${idx}=${fnAsync ? 'await ' : ''}${fnKey}(${fn.length === 0 ? '' : noContext ? 'r' : 'r,c'});if(c${idx} instanceof Response)return c${idx};`);
                    ++idx;
                }
            }

            statements.push('return r;');
        }

        return Function(...keys, `return ${hasAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
    }
}

export type BaseRoute = Route<any, any, any>;

// Route list
export type RoutesRecord = BaseRoute[];

