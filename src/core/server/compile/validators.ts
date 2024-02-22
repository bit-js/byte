import type { BaseValidatorRecord, Fn } from '../types';
import isVariableName from '../../utils/isVariableName';

export default function compileValidator(handler: Fn, validators: BaseValidatorRecord) {
    if (typeof validators === 'undefined') return handler;

    const keys = [], statements = [],
        values = [], paramsKeys = [];

    let isAsync = false, noContext = true, idx = 0;

    for (const key in validators) {
        if (!isVariableName(key))
            throw new Error(`State name ${key} must be a valid JavaScript variable name!`);
        paramsKeys.push(key);

        // Validator
        const fn = validators[key], fnKey = 'f' + idx;

        keys.push(fnKey);
        values.push(fn);

        const fnAsync = fn.constructor.name === 'AsyncFunction';
        isAsync = isAsync || fnAsync;

        const fnNoContext = fn.length === 0;
        noContext = noContext && fnNoContext;

        statements.push(`const ${key}=${fnAsync ? 'await ' : ''}${fnKey}(${noContext ? '' : 'c'});if(${key} instanceof Response)return ${key}`);
    }

    statements.push(`c.state={${paramsKeys.join()}}`);

    // Restricted variable for the main handler
    keys.push('$');
    values.push(handler);

    const fnNoContext = handler.length === 0;
    noContext = noContext && fnNoContext;

    // Save some milliseconds if the function is async
    statements.push(`return ${handler.constructor.name === 'AsyncFunction' && isAsync ? 'await ' : ''}$(${noContext ? '' : 'c'})`);

    // Build the function
    return Function(...keys, `return ${isAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
}
