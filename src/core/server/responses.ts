import createSend from './compile/send';

// Basic response
export interface BasicResponse<T> extends Response {
    text(): Promise<T extends string ? T : string>;
    clone(): this;
}

// JSON response
export interface JsonResponse<T> extends Response {
    json(): Promise<T>;
    clone(): this;
}

/**
 * Basic response format
 */
export const send: {
    /**
     * Send a `BodyInit` as response
     */
    body<const T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send response as JSON
     */
    json<const T>(body: T, init?: ResponseInit): JsonResponse<T>;

    /**
     * Send binary response
     */
    binary<const T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send XML response
     */
    xml<const T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Send HTML response
     */
    html<const T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T>;

    /**
     * Stream server-sent events
     */
    events(body: ReadableStream, init?: ResponseInit): Response;

    /**
     * Redirect to provided href
     */
    link(href: string, status: 301 | 302 | 307 | 308): Response;
} = {
    body: (body, init): any => new Response(body, init),

    json: createSend({ 'Content-Type': 'application/json' }, 'JSON.stringify'),
    xml: createSend({ 'Content-Type': 'application/xml' }, null),
    binary: createSend({ 'Content-Type': 'application/octet-stream' }, null),
    html: createSend({ 'Content-Type': 'text/html' }, null),
    events: createSend({ 'Content-Type': 'text/event-stream' }, null),

    link: (Location, status) => new Response(null, { status, headers: { Location } })
};
