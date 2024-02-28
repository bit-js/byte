import type { Fn } from '../types';
import type { AwaitedReturn, MaybePromise } from '../../utils/types';
import type { GenericResponse } from './responses';

import { $async } from './macro';

export interface ParserOptions<T, R = T> {
    then?(data: T): MaybePromise<R> | GenericResponse;
    catch?(error: any): GenericResponse;
}

export type InferParser<T extends ParserOptions<any>> = Fn<
    Promise<AwaitedReturn<T['then']> | AwaitedReturn<T['catch']> | Response>
>;

function compileParser(parserBody: string) {
    return (options?: ParserOptions<any>) => {
        if (typeof options === 'undefined')
            return $async(Function(parserBody)());

        const statement: string[] = [parserBody];

        const { then, catch: errFn } = options;
        if (typeof then !== 'undefined')
            statement.push('then(f1)');
        if (typeof errFn !== 'undefined')
            statement.push('catch(f2)');

        return $async(Function('f1', 'f2', statement.join('.'))(then, errFn));
    }
}

/**
 * Parse request body
 */
export const parse: {
    /**
     * Create a text parser
     */
    text<T extends ParserOptions<string> = ParserOptions<string>>(options?: T): InferParser<T>;

    /**
     * Create a text parser
     */
    json<T extends ParserOptions<any> = ParserOptions<any>>(options?: T): InferParser<T>;

    /**
     * Create a text parser
     */
    form<T extends ParserOptions<FormData> = ParserOptions<FormData>>(options?: T): InferParser<T>;

    /**
     * Create a text parser
     */
    blob<T extends ParserOptions<Blob> = ParserOptions<Blob>>(options?: T): InferParser<T>;

    /**
     * Create a text parser
     */
    buffer<T extends ParserOptions<ArrayBuffer> = ParserOptions<ArrayBuffer>>(options?: T): InferParser<T>;
} = {
    text: compileParser('return (c)=>c.req.text()'),
    json: compileParser('return (c)=>c.req.json()'),
    blob: compileParser('return (c)=>c.req.blob()'),
    form: compileParser('return (c)=>c.req.form()'),
    buffer: compileParser('return (c)=>c.req.arrayBuffer()'),
};
