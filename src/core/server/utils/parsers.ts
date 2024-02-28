import type { AwaitedReturn } from '../../utils/types';
import { $async } from './macro';

export interface ParserOptions<T, R = T> {
    next?(data: T): R;
    catch?(error: any): Response | Promise<Response>;
}

function compileParser(parserBody: string) {
    return (options?: ParserOptions<any>) => {
        if (typeof options === 'undefined')
            return $async(Function(parserBody)());

        const statement: string[] = [parserBody];

        const { next, catch: errFn } = options;
        if (typeof next !== 'undefined')
            statement.push('then(f1)');
        if (typeof errFn !== 'undefined')
            statement.push('catch(f2)');

        return $async(Function('f1', 'f2', statement.join('.'))(next, errFn));
    }
}

export const parse: {
    /**
     * Create a text parser
     */
    text<T extends ParserOptions<string> = ParserOptions<string>>(options?: T): Promise<AwaitedReturn<T['next']> | Response>;

    /**
     * Create a text parser
     */
    json<T extends ParserOptions<any> = ParserOptions<any>>(options?: T): Promise<AwaitedReturn<T['next']> | Response>

    /**
     * Create a text parser
     */
    form<T extends ParserOptions<FormData> = ParserOptions<FormData>>(options?: T): Promise<AwaitedReturn<T['next']> | Response>

    /**
     * Create a text parser
     */
    blob<T extends ParserOptions<Blob> = ParserOptions<Blob>>(options?: T): Promise<AwaitedReturn<T['next']> | Response>

    /**
     * Create a text parser
     */
    buffer<T extends ParserOptions<ArrayBuffer> = ParserOptions<ArrayBuffer>>(options?: T): Promise<AwaitedReturn<T['next']> | Response>
} = {
    text: compileParser('return (c)=>c.req.text()'),
    json: compileParser('return (c)=>c.req.json()'),
    blob: compileParser('return (c)=>c.req.blob()'),
    form: compileParser('return (c)=>c.req.form()'),
    buffer: compileParser('return (c)=>c.req.arrayBuffer()'),
};
