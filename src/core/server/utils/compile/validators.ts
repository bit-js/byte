import type { Fn } from '../../types';
import isVariableName from '../../../utils/isVariableName';
import { isAsync, passChecks } from '../macro';

export default function compileValidator(handler: Fn, validators: Record<string, Fn>) {
    if (typeof validators === 'undefined') return handler;

    const keys = [], statements = [],
        values = [], paramsKeys = [];

    let hasAsync = false, noContext = true, idx = 0;

    for (const key in validators) {
        if (!isVariableName(key))
            throw new Error(`State name ${key} must be a valid JavaScript variable name!`);

        // Validator
        const fn = validators[key], fnKey = 'f' + idx;

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
