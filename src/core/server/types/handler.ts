import { Context as TypedContext, type Params } from '@bit-js/blitz';
import type { BasicResponse, GenericResponse, JsonResponse, NullableBody } from '../utils/responses';
import type { CommonHeaders, CommonResponseInit } from '../types/responseInit';

// Base context
export class Context<Params, State = undefined> extends TypedContext<Params> implements CommonResponseInit {
    state!: State;
    headers = {} as CommonHeaders;

    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T): BasicResponse<T> {
        return new Response(body, this) as any;
    }

    /**
     * Send a response with only head
     */
    head(): Response {
        return new Response(null, this);
    }

    /**
     * Send a primitive value as response
     */
    value<const T extends string | number | bigint | boolean | null | undefined>(body: T): BasicResponse<`${T}`> {
        return new Response(`${body}`, this) as any;
    }

    /**
     * Send response as plain text
     */
    text<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'text/plain';
        return new Response(body, this) as any;
    }

    /**
     * Send response as JSON
     */
    json<const T>(body: T): JsonResponse<T> {
        this.headers['Content-Type'] = 'application/json';
        return new Response(JSON.stringify(body), this);
    }

    /**
     * Send binary response
     */
    binary<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'application/octet-stream';
        return new Response(body, this) as any;
    }

    /**
     * Send XML response
     */
    xml<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'application/xml';
        return new Response(body, this) as any;
    }

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'text/html';
        return new Response(body, this) as any;
    }

    /**
     * Stream server-sent events
     */
    events<const T extends NullableBody>(body: T): BasicResponse<T> {
        const { headers } = this;

        headers['Content-Type'] = 'text/event-stream';
        headers['Cache-Control'] = 'no-cache';
        headers['Connection'] = 'keep-alive';

        return new Response(body, this) as any;
    }
};
export type BaseContext = Context<any, any>;

// Basic handler and actions
export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => GenericResponse;
export type ActionList<Path extends string> = ((c: Context<Params<Path>>) => any)[];

// A function with one argument
export type Fn<R = any> = (c: BaseContext) => R;
