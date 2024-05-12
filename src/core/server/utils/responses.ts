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
        return typeof init === 'undefined'
            ? (): any => new Response(body)
            : (): any => new Response(body, init);
    },

    text<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        if (typeof init === 'undefined')
            return (): any => new Response(body, textInit);

        if (typeof init.headers === 'undefined')
            init.headers = textHeaders;
        else
            init.headers['Content-Type'] = 'text/plain';

        return (): any => new Response(body, init);
    },

    json<const T>(body: T, init?: CommonResponseInit): () => JsonResponse<T> {
        const jsonBody = JSON.stringify(body);

        if (typeof init === 'undefined')
            return (): any => new Response(jsonBody, jsonInit);

        if (typeof init.headers === 'undefined')
            init.headers = jsonHeaders;
        else
            init.headers['Content-Type'] = 'application/json';

        return (): any => new Response(jsonBody, init);
    },

    html<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        if (typeof init === 'undefined')
            return (): any => new Response(body, htmlInit);

        if (typeof init.headers === 'undefined')
            init.headers = htmlHeaders;
        else
            init.headers['Content-Type'] = 'text/html';

        return (): any => new Response(body, init);
    }
};
