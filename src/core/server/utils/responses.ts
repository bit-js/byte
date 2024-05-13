import type { CommonResponseInit } from '../types/responseInit';
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

const textHeaders = { 'Content-Type': 'text/plain' };
const textInit = { headers: textHeaders };

const jsonHeaders = { 'Content-Type': 'application/json' };
const jsonInit = { headers: jsonHeaders };

const htmlHeaders = { 'Content-Type': 'text/html' };
const htmlInit = { headers: htmlHeaders };

/**
 * Create a static response handler
 */
export const send = {
    body<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        const res = typeof init === 'undefined' ? new Response(body) : new Response(body, init);
        return (): any => res.clone();
    },

    text<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        if (typeof init === 'undefined')
            init = textInit;

        if (typeof init.headers === 'undefined')
            init.headers = textHeaders;
        else
            init.headers['Content-Type'] = 'text/plain';

        const res = new Response(body, init);
        return (): any => res.clone();
    },

    json<const T>(body: T, init?: CommonResponseInit): () => JsonResponse<T> {
        if (typeof init === 'undefined')
            init = jsonInit;

        if (typeof init.headers === 'undefined')
            init.headers = jsonHeaders;
        else
            init.headers['Content-Type'] = 'application/json';

        const res = new Response(JSON.stringify(body), init);
        return (): any => res.clone();
    },

    html<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        if (typeof init === 'undefined')
            init = htmlInit;

        if (typeof init.headers === 'undefined')
            init.headers = htmlHeaders;
        else
            init.headers['Content-Type'] = 'text/html';

        const res = new Response(body, init);
        return (): any => res.clone();
    }
};
