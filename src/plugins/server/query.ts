import { $pass, type BaseContext, type GenericResponse } from '../../core/server';
import { forbidden } from '../../utils/defaultOptions';

export type QuerySchemaTypes = 'string' | 'number' | 'bool';

interface TypeMap {
    string: string;
    number: number;
    bool: boolean;
}

export interface QuerySchema extends Record<string, QuerySchemaTypes> { }
export type InferQuerySchema<T extends QuerySchema> = {
    [K in keyof T]: TypeMap[T[K]];
}

export const query = {
    /**
     * Get a single value of the key from the query
     */
    value(name: string): (ctx: BaseContext) => string | null {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return $pass(Function(`return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return n===-1?url.substring(i):url.substring(i,n);}`)());
    },

    /**
     * Get multiple values of the key from the query
     */
    values(name: string, maxValues: number): (ctx: BaseContext) => string[] {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return $pass(Function(`return ({pathEnd,req:{url}})=>{const r=[];let i=url.indexOf(${search},pathEnd+1)+${searchLen};while(i!===${searchLen - 1}${typeof maxValues === 'number' ? `&&r.length<${maxValues}` : ''}){const n=url.indexOf("&",i);if(n===-1){r.push(url.substring(i));return r;}r.push(url.substring(i,n));i=url.indexOf(${search},n+1)}return r}`)());
    },

    /**
     * Parse multiple keys
     */
    schema<Schema extends QuerySchema>(schema: Schema, fallback?: (ctx: BaseContext) => GenericResponse): (ctx: BaseContext) => InferQuerySchema<Schema> | GenericResponse {
        const checks = ['++pathEnd;'], idxCheck = [], objParts = [];
        let idx = 0;

        const noFallback = typeof fallback === 'undefined';
        const hasArgs = !noFallback && fallback.length !== 0;
        const fallbackCall = noFallback ? 'new Response(null,h)' : (hasArgs ? 'f(c)' : 'f()');

        for (const key in schema) {
            const type = schema[key];

            if (type === 'bool') {
                const search = JSON.stringify(encodeURIComponent(key));
                objParts.push(`${key}:url.indexOf(${search},pathEnd)!==-1`);
            } else {
                const search = JSON.stringify(encodeURIComponent(key) + '=');
                const searchLen = search.length - 2;

                if (type === 'string') {
                    checks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return ${fallbackCall};`);
                    idxCheck.push(`const i${idx}=url.indexOf("&",s${idx});`);
                    objParts.push(`${key}:i${idx}===-1?url.substring(s${idx}):url.substring(s${idx},i${idx})`);
                } else {
                    checks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return ${fallbackCall};const i${idx}=url.indexOf("&",s${idx});const ${key}=i${idx}===-1?+url.substring(s${idx}):+url.substring(s${idx},i${idx});if(Number.isNaN(${key}))return ${fallbackCall};`);
                    objParts.push(key);
                }

                ++idx;
            }
        }

        return Function('f', 'h', `return (${hasArgs ? 'c' : '{pathEnd,req:{url}}'})=>{${checks.join('')}${idxCheck.join('')}return {${objParts.join()}};}`)(fallback, forbidden);
    }
};
