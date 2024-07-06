import type { Fn } from '../types/handler';

// Mark async macro
export const AsyncFunction = (async function () { }).constructor;
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

// Setter macro
const setterSymbol = Symbol('set');
export function $set<T extends Fn>(prop: string, fn: T): T {
    // @ts-ignore
    fn[setterSymbol] = prop;
    return fn;
}
export function getPropOfSetter(fn: any): string | undefined {
    return fn[setterSymbol];
}

// Setter state macro
const stateSetterSymbol = Symbol('set');
export function $state<T extends Fn>(prop: string, fn: T): T {
    // @ts-ignore
    fn[stateSetterSymbol] = prop;
    return fn;
}
export function getPropOfState(fn: any): string | undefined {
    return fn[stateSetterSymbol];
}
