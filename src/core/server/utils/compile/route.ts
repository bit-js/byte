import type { BaseRoute, Fn } from '../../types';
import isVariableName from '../../../utils/isVariableName';
import { isAsync, passChecks } from '../macro';

export default function compileRoute(route: BaseRoute, actions: Fn[]) {
    const { handler, validator } = route;
    if (typeof validator === 'undefined') return handler;

    const keys = [], statements = [],
        values = [], paramsKeys = [];

    let hasAsync = false, noContext = true, idx = 0;

    for (let i = 0, { length } = actions; i < length; ++i) {
        // Validator
        const fn = actions[i], fnKey = 'f' + idx;

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
        statements.push(`const ${valKey}=${result};if (${valKey} instanceof Response)return ${valKey}`);

        ++idx;
    }

    for (const key in validator) {
        if (!isVariableName(key))
            throw new Error(`State name ${key} must be a valid JavaScript variable name!`);

        // Validator
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

    statements.push(`c.state={${paramsKeys.join()}}`);

    // Restricted variable for the main handler
    keys.push('$');
    values.push(handler);

    const fnNoContext = handler.length === 0;
    noContext = noContext && fnNoContext;

    // Save some milliseconds if the function is async
    statements.push(`return ${isAsync(handler) && hasAsync ? 'await ' : ''}$(${noContext ? '' : 'c'})`);

    // Build the function
    return Function(...keys, `return ${hasAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
}
