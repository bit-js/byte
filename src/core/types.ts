import { type t } from 'wint-js';
import { type serve } from 'bun';

/**
 * Request body
 */
export interface Context<Path extends string = any> extends t.Context<Path>, ResponseInit { };

export interface Handler<Path extends string = any, Result = any> {
    (ctx: Context<Path>): Result;
}

/**
 * Serve options
 */
export type Serve = Partial<Parameters<typeof serve>[0]>;

export type Wrapper = (f: Handler<any, any>) => Handler<any, any>;
