import type { Params } from '@bit-js/blitz';
import { htmlPair, jsonPair, type BasicResponse, type JsonResponse, type NullableBody } from '../utils/responses';
import type { CommonHeaders, CommonResponseInit } from '../types/responseInit';

// Base context
export class Context<Params, State = undefined> implements CommonResponseInit {
    state!: State;
    status!: number;
    headers: CommonHeaders;

    readonly path: string;
    readonly pathStart: number;
    readonly pathEnd: number;
    readonly params!: Params;
    readonly req: Request;

    /**
     * Parse the request
     */
    constructor(req: Request) {
        this.req = req;
        this.headers = [];

        const { url } = req;

        const start = url.indexOf('/', 12);
        const end = url.indexOf('?', start + 1);
        const pathEnd = end === -1 ? url.length : end;

        this.pathStart = start;
        this.pathEnd = pathEnd;
        this.path = url.substring(start, pathEnd);
    }

    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T): BasicResponse<T> {
        return new Response(body, this as any) as any;
    }

    /**
     * Send response as JSON
     */
    json<const T>(body: T): JsonResponse<T> {
        this.headers.push(jsonPair);
        return new Response(JSON.stringify(body), this as any);
    }

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers.push(htmlPair);
        return new Response(body, this as any) as any;
    }

    /**
     * Send HTML response
     */
    redirect(location: string, status: 301 | 302 | 307 | 308): Response {
        this.headers.push(['Location', location]);
        this.status = status;
        return new Response(null, this as any);
    }
};

export type BaseContext = Context<any, any>;

// Basic handler and actions
export type BaseHandler<Path extends string, Set, State = undefined> = (c: Context<Params<Path>, State> & Set) => any;

export type Fn<T = any> = (c: BaseContext & T) => any;
export type DeferFn<T = any> = (c: BaseContext & T & { res: any }) => any;
