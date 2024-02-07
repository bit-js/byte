import { type t } from 'wint-js';
import { type serve } from 'bun';

/**
 * Request body
 */
export interface Context<Path extends string = any, State extends t.BaseState = any> extends Omit<t.Context<Path, State>, keyof Bun.ResponseInit>, Bun.ResponseInit {
    headers: Record<string, string>
};

export interface Handler<Path extends string = any, State extends t.BaseState = any> {
    (ctx: Context<Path, State>): any;
}

/**
 * Serve options
 */
export type Serve = Partial<Parameters<typeof serve>[0]>;

export type Wrapper = (f: Handler<any>) => Handler<any>;
