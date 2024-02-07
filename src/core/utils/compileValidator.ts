import type { Validator } from '../routes';
import type { Handler } from '../types';

function getArgs(fn: Handler<any, any>) {
    return fn.length > 0 ? 'c' : '';
}

export default function compileValidator(vld: Validator<any> | undefined, fn: Handler<any, any>) {
    if (typeof vld === 'undefined') return fn;

    const checks = [], sets = [], params = ['f'], values = [fn];
    let isAsync = false, fnCnt = 1;

    for (const key in vld) {
        const fn = (vld as any)[key],
            resVar = `r${fnCnt}`,
            fnName = `f${fnCnt.toString()}`;

        // Inject the function to the scope
        params.push(fnName);
        values.push(fn);

        // Generate function call statement
        let fnCall = `${fnName}(${getArgs(fn)});`;

        // Append await to function call if current function is async
        if (fn.constructor.name === 'AsyncFunction') {
            isAsync = true;
            fnCall = 'await ' + fnCall;
        }

        checks.push(`const ${resVar}=${fnCall};if(${resVar}===null)return null`);
        sets.push(`${key}:${resVar}`);

        ++fnCnt;
    }

    return Function(...params, `return ${isAsync ? 'async ' : ''}c=>{${checks.join(';')};c.state={${sets.join(',')}};return f(${getArgs(fn)})}`)(...values);
}
