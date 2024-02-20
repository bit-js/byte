// Basic response
export interface BasicResponse<T extends BodyInit> extends Response {
    text(): Promise<T extends string ? T : string>;
    clone(): this;
}
export const BasicResponse: new <T extends BodyInit>(body: T, init?: ResponseInit) => BasicResponse<T> = Response as any;

// JSON response
const jsonHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
const jsonInit: ResponseInit = { headers: jsonHeaders };

export interface JsonResponse<T> extends Response {
    json(): Promise<T>;
}

export class JsonResponse<const T> extends Response {
    /**
     * Response JSON
     */
    constructor(body: T, init?: ResponseInit) {
        if (typeof init === 'undefined') init = jsonInit;
        else {
            if (typeof init.headers === 'undefined') init.headers = jsonHeaders;
            // @ts-expect-error
            else init.headers['Content-Type'] ??= 'application/json';
        }

        super(JSON.stringify(body), init);
    }
}

// HTML response
const htmlHeaders: Record<string, string> = { 'Content-Type': 'text/html' };
const htmlInit: ResponseInit = { headers: htmlHeaders };

export interface HtmlResponse<T extends BodyInit> extends Response {
    text(): Promise<T extends string ? T : string>;
    clone(): this;
}

export class HtmlResponse<T> extends Response {
    /**
     * Response HTML
     */
    constructor(body: T, init?: ResponseInit) {
        if (typeof init === 'undefined') init = htmlInit;
        else {
            if (typeof init.headers === 'undefined') init.headers = htmlHeaders;
            // @ts-expect-error
            else init.headers['Content-Type'] ??= 'text/html';
        }

        super(body, init);
    }
}

