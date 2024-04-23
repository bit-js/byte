import { Context as TypedContext, type Params } from '@bit-js/blitz';
import type { GenericResponse } from '../utils/responses';
import type { CommonHeaders, CommonResponseInit } from '../types/responseInit';

// Base context
export class Context<Params, State = undefined> extends TypedContext<Params> implements CommonResponseInit {
    state!: State;
    headers = {} as CommonHeaders;
};
export type BaseContext = Context<any, any>;

// Basic handler and actions
export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => GenericResponse;
export type ActionList<Path extends string> = ((c: Context<Params<Path>>) => any)[];

// A function with one argument
export type Fn<R = any> = (c: BaseContext) => R;
