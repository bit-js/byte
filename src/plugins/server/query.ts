import type { BaseContext } from '../../core/server';

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
     * Get a single value of the key from the query
     */
    get(name: string): (ctx: BaseContext) => string | null {
        // '"key="'
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return Function(`return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return n===-1?url.substring(i):url.substring(i,n);}`)();
    },

    /**
     * Get multiple values of the key from the query
     */
    getAll(name: string, maxValues: number): (ctx: BaseContext) => string[] {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return Function(`return ({pathEnd,req:{url}})=>{const r=[];let i=url.indexOf(${search},pathEnd+1)+${searchLen};while(i!===${searchLen - 1}${typeof maxValues === 'number' ? `&&r.length<${maxValues}` : ''}){const n=url.indexOf("&",i);if(n===-1){r.push(url.substring(i));return r;}r.push(url.substring(i,n));i=url.indexOf(${search},n+1)}return r}`)();
    },

    /**
     * Parse multiple keys
     */
    schema<Schema extends QuerySchema>(schema: Schema): (ctx: BaseContext) => InferQuerySchema<Schema> | null {
        const idxChecks = ['++pathEnd;'], valueChecks = [], idxs = [], objParts = [];
        let idx = 0;

        for (const key in schema) {
            const type = schema[key];

            if (type === 'bool') {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key));
                const searchLen = search.length - 2;

                idxs.push(`const i${idx}=url.indexOf(${search},pathEnd)+${searchLen};`)

                // Check if the end index of the key is & or end of the string
                objParts.push(`${key}:i${idx}!==${searchLen - 1}&&(i${idx}===url.length||url.charCodeAt(i${idx})===38)`);
            } else {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key) + '=');
                const searchLen = search.length - 2;

                if (type === 'string') {
                    idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                    idxs.push(`const i${idx}=url.indexOf("&",s${idx});`);
                    objParts.push(`${key}:i${idx}===-1?url.substring(s${idx}):url.substring(s${idx},i${idx})`);
                } else {
                    idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                    valueChecks.push(`const i${idx}=url.indexOf("&",s${idx});const ${key}=i${idx}===-1?+url.substring(s${idx}):+url.substring(s${idx},i${idx});if(Number.isNaN(${key}))return null;`);
                    objParts.push(key);
                }

                ++idx;
            }

            ++idx;
        }

        return Function(`return ({pathEnd,req:{url}})=>{${idxChecks.join('')}${valueChecks.join('')}${idxs.join('')}return {${objParts.join()}};}`)();
    }
};
