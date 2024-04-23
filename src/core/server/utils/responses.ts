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

type NullableBody = BodyInit | null;

// Default headers and init values
const textHeaders = { 'Content-Type': 'text/plain' };
const textInit = { headers: textHeaders };

const jsonHeaders = { 'Content-Type': 'application/json' };
const jsonInit = { headers: jsonHeaders };

const binaryHeaders = { 'Content-Type': 'application/octet-stream' };
const binaryInit = { headers: binaryHeaders };

const xmlHeaders = { 'Content-Type': 'application/xml' };
const xmlInit = { headers: xmlHeaders };

const htmlHeaders = { 'Content-Type': 'text/html' };
const htmlInit = { headers: htmlHeaders };

const eventHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
};
const eventInit = { headers: eventHeaders };

/**
 * Basic response format
 */
export const send = {
    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        return typeof init === 'undefined'
            ? new Response(body) as any
            : new Response(body, init) as any;
    },

    /**
     * Send a response with only head
     */
    head(init: CommonResponseInit): Response {
        return new Response(null, init);
    },

    /**
     * Create a static response handler
     */
    static<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        return typeof init === 'undefined'
            ? (): any => new Response(body)
            : (): any => new Response(body, init);
    },

    /**
     * Send a primitive value as response
     */
    value<const T extends string | number | bigint | boolean | null | undefined>(body: T, init?: CommonResponseInit): BasicResponse<`${T}`> {
        return typeof init === 'undefined'
            ? new Response(`${body}`) as any
            : new Response(`${body}`, init) as any;
    },

    /**
    * Redirect to provided href
    */
    link(Location: string, status: 301 | 302 | 307 | 308): Response {
        return new Response(null, { headers: { Location }, status });
    },

    /**
     * Send response as plain text
     */
    text<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        if (typeof init === 'undefined')
            return new Response(body, textInit) as any;

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = textHeaders;
        else headers['Content-Type'] = 'text/plain';

        return new Response(body, init) as any;
    },

    /**
     * Send response as JSON
     */
    json<const T>(body: T, init?: CommonResponseInit): JsonResponse<T> {
        if (typeof init === 'undefined')
            return new Response(JSON.stringify(body), jsonInit);

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = jsonHeaders;
        else headers['Content-Type'] = 'application/json';

        return new Response(JSON.stringify(body), init);
    },

    /**
     * Send binary response
     */
    binary<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        if (typeof init === 'undefined')
            return new Response(body, binaryInit) as any;

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = binaryHeaders;
        else headers['Content-Type'] = 'application/octet-stream';

        return new Response(body, init) as any;
    },

    /**
     * Send XML response
     */
    xml<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        if (typeof init === 'undefined')
            return new Response(body, xmlInit) as any;

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = xmlHeaders;
        else headers['Content-Type'] = 'application/xml';

        return new Response(body, init) as any;
    },

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        if (typeof init === 'undefined')
            return new Response(body, htmlInit) as any;

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = htmlHeaders;
        else headers['Content-Type'] = 'text/html';

        return new Response(body, init) as any;
    },

    /**
     * Stream server-sent events
     */
    events<const T extends NullableBody>(body: T, init?: CommonResponseInit): BasicResponse<T> {
        if (typeof init === 'undefined')
            return new Response(body, eventInit) as any;

        const { headers } = init;

        if (typeof headers === 'undefined') init.headers = eventHeaders;
        else {
            headers['Content-Type'] = 'text/event-stream';
            headers['Cache-Control'] = 'no-cache';
            headers['Connection'] = 'keep-alive';
        };

        return new Response(body, init) as any;
    },
};
