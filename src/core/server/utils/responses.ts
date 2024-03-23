import type { MaybePromise } from '../../utils/types';
import createSend from './compile/send';

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

export interface FormRecord extends Record<string, FormDataEntryValue> { };

export interface BasicForm<T extends FormRecord> extends FormData {
    get<K extends keyof T>(name: K): T[K];
    get(name: string): null;
}

type NullableBody = BodyInit | null;

/**
 * Basic response format
 */
export const send: {
    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send response as plain text
     */
    text<const T extends NullableBody>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send response as JSON
     */
    json<const T>(body: T, init?: ResponseInit): JsonResponse<T>;

    /**
     * Send binary response
     */
    binary<const T extends NullableBody>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send XML response
     */
    xml<const T extends NullableBody>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Stream server-sent events
     */
    events(body: ReadableStream, init?: ResponseInit): Response;

    /**
     * Redirect to provided href
     */
    link(href: string, status: 301 | 302 | 307 | 308): Response;
} = {
    // Basically inlining can work here when init is not passed in as a parameter I guess
    body: (body, init): any => typeof init === 'undefined' ? new Response(body) : new Response(body, init),

    // All stuff down here cannot be inlined
    text: createSend({ 'Content-Type': 'text/plain' }, null),
    json: createSend({ 'Content-Type': 'application/json' }, 'JSON.stringify'),
    xml: createSend({ 'Content-Type': 'application/xml' }, null),
    binary: createSend({ 'Content-Type': 'application/octet-stream' }, null),
    html: createSend({ 'Content-Type': 'text/html' }, null),
    events: createSend({ 'Content-Type': 'text/event-stream' }, null),

    // This response object can be reused multiple time
    link: (Location, status) => new Response(null, { status, headers: { Location } })
};
