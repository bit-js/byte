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

/**
 * Basic response format
 */
export const send = {
    /**
     * Create a static response handler
     */
    static<const T extends NullableBody>(body: T, init?: CommonResponseInit): () => BasicResponse<T> {
        return typeof init === 'undefined'
            ? (): any => new Response(body)
            : (): any => new Response(body, init);
    }
};
