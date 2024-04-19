import type { Fn } from '../types/handler';

// Mark async macro
export const AsyncFunction = (async function() { }).constructor;
export function $async<T extends Fn>(fn: T): T {
    fn.constructor = AsyncFunction;
    return fn;
}
export function isAsync(fn: any) {
    return fn.constructor === AsyncFunction;
}

// Skip checks macro
const passSymbol = Symbol('pass');
export function $pass<T extends Fn>(fn: T): T {
    // @ts-ignore
    fn[passSymbol] = true;
    return fn;
}
export function passChecks(fn: any) {
    return passSymbol in fn;
}
