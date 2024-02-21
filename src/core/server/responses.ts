// Basic response
export interface BasicResponse<T extends BodyInit> extends Response {
    text(): Promise<T extends string ? T : string>;
    clone(): this;
}

export function send<T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T> {
    return new Response(body, init) as any;
}

// JSON response
const jsonHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
const jsonInit: ResponseInit = { headers: jsonHeaders };

export interface JsonResponse<T> extends Response {
    json(): Promise<T>;
}

/**
 * Send response as JSON
 */
export function sendJson<const T>(body: T, init?: ResponseInit): JsonResponse<T> {
    if (typeof init === 'undefined')
        return new Response(JSON.stringify(body), jsonInit);

    if (typeof init.headers === 'undefined') init.headers = jsonHeaders;
    // @ts-expect-error
    else init.headers['Content-Type'] ??= 'application/json';

    return new Response(JSON.stringify(body), init);
}

// HTML response
const htmlHeaders: Record<string, string> = { 'Content-Type': 'text/html' };
const htmlInit: ResponseInit = { headers: htmlHeaders };

/**
 * Send HTML response
 */
export function sendHtml<T extends BodyInit>(body: T, init?: ResponseInit): BasicResponse<T> {
    if (typeof init === 'undefined')
        return new Response(body, htmlInit) as any;

    if (typeof init.headers === 'undefined') init.headers = htmlHeaders;
    // @ts-expect-error
    else init.headers['Content-Type'] ??= 'text/html';

    return new Response(body, init) as any;
}

