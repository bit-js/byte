import type { Fn } from '../types/handler';
import type { AwaitedReturn, MaybePromise } from '../../utils/types';
import type { GenericResponse } from './responses';

import { $async, $pass } from './macro';

interface ParserOptions<T, R = T> {
    then?(data: T): MaybePromise<R> | GenericResponse;
    catch?(error: any): GenericResponse;
}

type InferParser<T extends ParserOptions<any>> = Fn<
    Promise<AwaitedReturn<T['then']> | AwaitedReturn<T['catch']>>
>;

const defaultText = $pass($async((ctx => ctx.req.text())));
const defaultJSON = $pass($async((ctx => ctx.req.json())));
const defaultForm = $pass($async((ctx => ctx.req.formData())));
const defaultBlob = $pass($async((ctx => ctx.req.blob())));
const defaultBuffer = $pass($async((ctx => ctx.req.arrayBuffer())));

/**
 * Parse request body
 */
export const parse = {
    /**
     * Create a text parser
     */
    text<T extends ParserOptions<string> = ParserOptions<string>>(options?: T): InferParser<T> {
        if (typeof options === 'undefined')
            // @ts-ignore
            return defaultText;

        const { then: thenFn, catch: catchFn } = options;

        // Has: 0 - then & catch, 1 - then, 2 - catch, 3 - nothing
        switch ((+(typeof thenFn === 'undefined') << 1) & +(typeof catchFn === 'undefined')) {
            // @ts-ignore
            case 0: return $async((ctx) => ctx.req.text().then(thenFn).catch(catchFn));
            // @ts-ignore
            case 1: return $async((ctx) => ctx.req.text().then(thenFn));
            // @ts-ignore
            case 2: return $async((ctx) => ctx.req.text().catch(catchFn));
            // @ts-ignore
            default: return defaultText;
        }
    },

    /**
     * Create a text parser
     */
    json<T extends ParserOptions<any> = ParserOptions<any>>(options?: T): InferParser<T> {
        if (typeof options === 'undefined')
            // @ts-ignore
            return defaultJSON;

        const { then: thenFn, catch: catchFn } = options;

        // Has: 0 - then & catch, 1 - then, 2 - catch, 3 - nothing
        switch ((+(typeof thenFn === 'undefined') << 1) & +(typeof catchFn === 'undefined')) {
            // @ts-ignore
            case 0: return $async((ctx) => ctx.req.json().then(thenFn).catch(catchFn));
            // @ts-ignore
            case 1: return $async((ctx) => ctx.req.json().then(thenFn));
            // @ts-ignore
            case 2: return $async((ctx) => ctx.req.json().catch(catchFn));
            // @ts-ignore
            default: return defaultJSON;
        }
    },

    /**
     * Create a text parser
     */
    form<T extends ParserOptions<FormData> = ParserOptions<FormData>>(options?: T): InferParser<T> {
        if (typeof options === 'undefined')
            // @ts-ignore
            return defaultForm;

        const { then: thenFn, catch: catchFn } = options;

        // Has: 0 - then & catch, 1 - then, 2 - catch, 3 - nothing
        switch ((+(typeof thenFn === 'undefined') << 1) & +(typeof catchFn === 'undefined')) {
            // @ts-ignore
            case 0: return $async((ctx) => ctx.req.formData().then(thenFn).catch(catchFn));
            // @ts-ignore
            case 1: return $async((ctx) => ctx.req.formData().then(thenFn));
            // @ts-ignore()
            case 2: return $async((ctx) => ctx.req.formData().catch(catchFn));
            // @ts-ignore
            default: return defaultForm;
        }
    },

    /**
     * Create a text parser
     */
    blob<T extends ParserOptions<Blob> = ParserOptions<Blob>>(options?: T): InferParser<T> {
        if (typeof options === 'undefined')
            // @ts-ignore
            return defaultBlob;

        const { then: thenFn, catch: catchFn } = options;

        // Has: 0 - then & catch, 1 - then, 2 - catch, 3 - nothing
        switch ((+(typeof thenFn === 'undefined') << 1) & +(typeof catchFn === 'undefined')) {
            // @ts-ignore
            case 0: return $async((ctx) => ctx.req.blob().then(thenFn).catch(catchFn));
            // @ts-ignore
            case 1: return $async((ctx) => ctx.req.blob().then(thenFn));
            // @ts-ignore
            case 2: return $async((ctx) => ctx.req.blob().catch(catchFn));
            // @ts-ignore
            default: return defaultBlob;
        }
    },

    /**
     * Create a text parser
     */
    buffer<T extends ParserOptions<ArrayBuffer> = ParserOptions<ArrayBuffer>>(options?: T): InferParser<T> {
        if (typeof options === 'undefined')
            // @ts-ignore
            return defaultBuffer;

        const { then: thenFn, catch: catchFn } = options;

        // Has: 0 - then & catch, 1 - then, 2 - catch, 3 - nothing
        switch ((+(typeof thenFn === 'undefined') << 1) & +(typeof catchFn === 'undefined')) {
            // @ts-ignore
            case 0: return $async((ctx) => ctx.req.buffer().then(thenFn).catch(catchFn));
            // @ts-ignore
            case 1: return $async((ctx) => ctx.req.buffer().then(thenFn));
            // @ts-ignore
            case 2: return $async((ctx) => ctx.req.buffer().catch(catchFn));
            // @ts-ignore
            default: return defaultBuffer;
        }
    }
};
