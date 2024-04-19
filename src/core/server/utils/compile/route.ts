import type { BaseRoute } from '../../types/route';
import type { Fn } from '../../types/handler';

import { isAsync, passChecks } from '../macro';

export default function compileRoute(route: BaseRoute, actions: Fn[]) {
    const { handler, validator } = route;
    // Return the raw handler
    if (validator === null && actions.length === 0) return handler;

    const keys = [], statements = [],
        values = [], paramsKeys = [];

    let hasAsync = false, noContext = true, idx = 0;

    // Compile actions and check result
    if (actions.length !== 0)
        for (let i = 0, { length } = actions; i < length; ++i) {
            const fn = actions[i];
            const fnKey = 'f' + idx;

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

    // Compile validators and check result
    if (validator !== null) {
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
