import type { BaseContext } from '../../core/server';
import decodeURIComponent from './decodeURI';

export type QuerySchemaTypes = 'string' | 'number' | 'bool';

interface TypeMap {
    string: string;
    number: number;
    bool: boolean;
}

export interface QuerySchema extends Record<string, QuerySchemaTypes> { }
export type InferQuerySchema<T extends QuerySchema> =
    { [K in Exclude<keyof T, `?${string}`>]: TypeMap[T[K]] }
    & { [K in Extract<keyof T, `?${string}`>]: TypeMap[T[K]] | null };

export const query = {
    /**
     * Whether query parsers should try to decode value
     */
    decodeValue: true,

    /**
     * Get a single value of the key from the query
     */
    get(name: string): (ctx: BaseContext) => string | null {
        // '"key="'
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        const { decodeValue } = this;
        return Function('d', `return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return ${decodeValue ? 'd(url,i,n===-1?url.length:n)' : 'n===-1?url.substring(i):url.substring(i,n)'};}`)(this.decode);
    },

    /**
     * Get multiple values of the key from the query
     */
    getAll(name: string, maxValues: number): (ctx: BaseContext) => string[] {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        const { decodeValue } = this;
        return Function('d', `return ({pathEnd,req:{url}})=>{const r=[];${decodeValue ? 'const {length}=url;' : ''}let i=url.indexOf(${search},pathEnd+1)+${searchLen};while(i!===${searchLen - 1}${typeof maxValues === 'number' ? `&&r.length<${maxValues}` : ''}){const n=url.indexOf("&",i);if(n===-1){r.push(${decodeValue ? 'd(url,i,length)' : 'url.substring(i)'});return r;}r.push(${decodeValue ? 'd(url,i,n)' : 'url.substring(i,n)'});i=url.indexOf(${search},n+1)}return r}`)(this.decode);
    },

    /**
     * Parse multiple keys
     */
    schema<Schema extends QuerySchema>(schema: Schema): (ctx: BaseContext) => InferQuerySchema<Schema> | null {
        const { decodeValue } = this;

        const idxChecks = ['++pathEnd;const {length}=url;'], valueChecks = [], idxs = [], objParts = [];
        let idx = 0;

        for (const key in schema) {
            const type = schema[key];

            if (type === 'bool') {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key));
                const searchLen = search.length - 2;

                idxs.push(`const i${idx}=url.indexOf(${search},pathEnd)+${searchLen};`)

                // Check if the end index of the key is & or end of the string
                objParts.push(`${key}:i${idx}!==${searchLen - 1}&&(i${idx}===length||url.charCodeAt(i${idx})===38)`);
            } else {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key) + '=');
                const searchLen = search.length - 2;

                if (type === 'string') {
                    idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                    idxs.push(`const i${idx}=url.indexOf("&",s${idx});`);
                    objParts.push(`${key}:${decodeValue ? `d(url,s${idx},i${idx}===-1?length:i${idx})` : `i${idx}===-1?url.substring(s${idx}):url.substring(s${idx},i${idx})`}`);
                } else {
                    idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                    valueChecks.push(`const i${idx}=url.indexOf("&",s${idx});const ${key}=i${idx}===-1?+url.substring(s${idx}):+url.substring(s${idx},i${idx});if(Number.isNaN(${key}))return null;`);
                    objParts.push(key);
                }
            }

            ++idx;
        }

        return Function('d', `return ({pathEnd,req:{url}})=>{${idxChecks.join('')}${valueChecks.join('')}${idxs.join('')}return {${objParts.join()}};}`)(this.decode);
    },

    /**
     * Try decode URI component. Fallback to the passed value if parsing failed
     */
    decode: decodeURIComponent,
};
