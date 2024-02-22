import type { BaseValidatorRecord, Fn } from '..';
import isVariableName from '../../utils/isVariableName';

export default function compileValidator(handler: Fn, validators: BaseValidatorRecord) {
    if (typeof validators === 'undefined') return handler;

    const keys = [], statements = [], values = [];

    let isAsync = false, noContext = true;

    for (const key in validators) {
        if (!isVariableName(key))
            throw new Error(`State name ${key} must be a valid JavaScript variable name!`);

        const fn = validators[key];

        keys.push(key);
        values.push(fn);

        const fnAsync = fn.constructor.name === 'AsyncFunction';
        isAsync = isAsync || fnAsync;

        const fnNoContext = fn.length === 0;
        noContext = noContext && fnNoContext;

        statements.push(`const ${key}=${fnAsync ? 'await ' : ''}${key}(${noContext ? '' : 'c'});if(${key} instanceof Response)return ${key}`);
    }

    // Restricted variable for the main handler
    keys.push('$');
    values.push(handler);

    const fnAsync = handler.constructor.name === 'AsyncFunction';
    isAsync = isAsync || fnAsync;

    const fnNoContext = handler.length === 0;
    noContext = noContext && fnNoContext;

    statements.push(`c.state={${keys.join()}};return ${fnAsync ? 'await ' : ''}$(${noContext ? '' : 'c'})`);

    // Build the function
    return Function(...keys, `return ${isAsync ? 'async ' : ''}(${noContext ? '' : 'c'})=>{${statements.join(';')}}`)(...values);
}
