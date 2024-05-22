import { Context as TypedContext, type Params } from '@bit-js/blitz';
import type { BasicResponse, JsonResponse, NullableBody } from '../utils/responses';
import type { CommonHeaders, CommonResponseInit } from '../types/responseInit';

// Base context
export class Context<Params, State = undefined> extends TypedContext<Params> implements CommonResponseInit {
    state!: State;

    status!: number;
    headers = {} as CommonHeaders;

    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T): BasicResponse<T> {
        return new Response(body, this as ResponseInit) as any;
    }

    /**
     * Send response as plain text
     */
    text<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'text/plain';
        return new Response(body, this as ResponseInit) as any;
    }

    /**
     * Send response as JSON
     */
    json<const T>(body: T): JsonResponse<T> {
        this.headers['Content-Type'] = 'application/json';
        return new Response(JSON.stringify(body), this as ResponseInit);
    }

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'text/html';
        return new Response(body, this as ResponseInit) as any;
    }

    /**
     * Send HTML response
     */
    redirect(location: string, status: 301 | 302 | 307 | 308): Response {
        this.headers.Location = location;
        this.status = status;
        return new Response(null, this as ResponseInit);
    }
};

export type BaseContext = Context<any, any>;

// Basic handler and actions
export type BaseHandler<Path extends string, State = undefined> = (c: Context<Params<Path>, State>) => any;

export type Fn<R = any> = (c: BaseContext) => R;
export type DeferFn = (c: BaseContext & { res: Response }) => any;
