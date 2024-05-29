import type { CommonHeaders, CommonResponseInit } from '../types/responseInit';
import type { MaybePromise } from '../../utils/types';

// Basic response
export interface BasicResponse<T> extends Response {
    text(): Promise<T extends string ? T : string>;
    clone(): this;
}

// What a normal handler should return
export type GenericResponse = MaybePromise<BasicResponse<any> | Response>;

// JSON response
export interface JsonResponse<T> extends Response {
    json(): Promise<T>;
    clone(): this;
}

export type NullableBody = BodyInit | null;

export const jsonPair = ['Content-Type', 'application/json'] satisfies CommonHeaders[number];
const jsonHeaders = [jsonPair] satisfies CommonHeaders;
const jsonInit = { headers: jsonHeaders };

export const htmlPair = ['Content-Type', 'text/html'] satisfies CommonHeaders[number];
const htmlHeaders = [htmlPair] satisfies CommonHeaders;
const htmlInit = { headers: htmlHeaders };

/**
 * Create a static response handler
 */
export const send = {
    body<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        const res = typeof init === 'undefined' ? new Response(body) : new Response(body, init as ResponseInit);
        return (): any => res.clone();
    },

    json<const T>(body: T, init?: CommonResponseInit): () => JsonResponse<T> {
        if (typeof init === 'undefined')
            init = jsonInit;
        else if (typeof init.headers === 'undefined')
            init.headers = jsonHeaders;
        else
            init.headers.push(jsonPair);

        const res = new Response(JSON.stringify(body), init as ResponseInit);
        return (): any => res.clone();
    },

    html<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        if (typeof init === 'undefined')
            init = htmlInit;
        else if (typeof init.headers === 'undefined')
            init.headers = htmlHeaders;
        else
            init.headers.push(htmlPair);

        const res = new Response(body, init as ResponseInit);
        return (): any => res.clone();
    }
};
