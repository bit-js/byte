import type { BaseContext } from '../../core/server';
import decodeURIComponent from './decodeURI';

export type QuerySchemaTypes = 'string' | 'number' | 'bool';

interface TypeMap {
    string: string;
    number: number;
    bool: boolean;
}

export interface QuerySchema extends Record<string, QueryPropertyOptions> { }
export type InferQuerySchema<T extends QuerySchema> = { [K in keyof T]: InferQueryPropertyOptions<T[K]> & {} };

// Query property options
export interface QueryPropertyOptions {
    type: QuerySchemaTypes;
    maxItems?: number;
}

export interface DefaultQueryPropertyOptions extends QueryPropertyOptions {
    type: 'string'
}

type InferType<T extends QuerySchemaTypes> = TypeMap[T] extends string ? string | null : TypeMap[T];

export type InferQueryPropertyOptions<T extends QueryPropertyOptions> =
    undefined extends T['maxItems'] ? InferType<T['type']>
    : T['maxItems'] extends 0 ? null
    : T['maxItems'] extends 1 ? InferType<T['type']>
    : TypeMap[T['type']][];

const defaultOptions: DefaultQueryPropertyOptions = { type: 'string' };

// Namespace
export const query = {
    /**
     * Whether query parsers should try to decode value
     */
    decodeValue: true,

    /**
     * Get values of a key from the query
     */
    get<Options extends QueryPropertyOptions = DefaultQueryPropertyOptions>(name: string, { type, maxItems }: Options = defaultOptions as Options): (ctx: BaseContext) => InferQueryPropertyOptions<Options> {
        if (type === 'bool') {
            // '"key"'
            const search = JSON.stringify(encodeURIComponent(name));
            const searchLen = search.length - 2;

            // Search for the key
            return Function(`return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1);return i!==-1&&(i===pathEnd+1||url.charCodeAt(i-1)===38)&&(i+${searchLen}===url.length||url.charCodeAt(i+${searchLen})===38);}`)();
        }

        // '"key="'
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        if (type === 'string') {
            const { decodeValue } = this;

            return typeof maxItems === 'undefined' || maxItems < 2
                ? Function('d', `return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return ${decodeValue ? 'd(url,i,n===-1?url.length:n)' : 'n===-1?url.substring(i):url.substring(i,n)'};}`)(this.decode)
                : Function('d', `return ({pathEnd,req:{url}})=>{let i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return [];const r=[];${decodeValue ? 'const {length}=url;' : ''}let l=0;do{const n=url.indexOf("&",i);if(n===-1){r.push(${decodeValue ? 'd(url,i,length)' : 'url.substring(i)'});return r;}r.push(${decodeValue ? 'd(url,i,n)' : 'url.substring(i,n)'});if(l===${maxItems - 1})return r;i=url.indexOf(${search},n+1)+${searchLen};++l;}while(i!==${searchLen - 1});return r;}`)(this.decode);
        }

        return typeof maxItems === 'undefined' || maxItems < 2
            ? Function(`return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return Number.NaN;const n=url.indexOf("&",i);return n===-1?+url.substring(i):+url.substring(i,n);}`)()
            : Function(`return ({pathEnd,req:{url}})=>{let i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return [];const r=[];let l=0;do{const n=url.indexOf("&",i);if(n===-1){const v=+url.substring(i);if(!Number.isNaN(v))r.push(v);return r;}const v=+url.substring(i,n);if(!Number.isNaN(v)){r.push(v);if(l===${maxItems - 1})return r;++l}i=url.indexOf(${search},n+1)+${searchLen};}while(i!==${searchLen - 1});return r;}`)();
    },

    /**
     * Parse multiple keys
     */
    schema<Schema extends QuerySchema>(schema: Schema): (ctx: BaseContext) => InferQuerySchema<Schema> | null {
        const { decodeValue } = this;

        const idxChecks = ['++pathEnd;const {length}=url;'], valueChecks = [], idxs = [], objParts = [];
        let idx = 0;

        for (const key in schema) {
            const { type, maxItems } = schema[key];

            if (type === 'bool') {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key));
                const searchLen = search.length - 2;

                idxs.push(`const i${idx}=url.indexOf(${search},pathEnd);`);
                objParts.push(`${key}:i${idx}!==-1&&(i${idx}===pathEnd||url.charCodeAt(i${idx}-1)===38)&&(i${idx}+${searchLen}===length||url.charCodeAt(i${idx}+${searchLen})===38)`);
            } else {
                // '"key="'
                const search = JSON.stringify(encodeURIComponent(key) + '=');
                const searchLen = search.length - 2;

                if (type === 'string') {
                    if (typeof maxItems === 'undefined' || maxItems < 2) {
                        idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                        idxs.push(`const i${idx}=url.indexOf("&",s${idx});`);
                        objParts.push(`${key}:${decodeValue ? `d(url,s${idx},i${idx}===-1?length:i${idx})` : `i${idx}===-1?url.substring(s${idx}):url.substring(s${idx},i${idx})`}`);
                    } else {
                        idxs.push(`const ${key}=[];let l${idx}=0;let i${idx}=url.indexOf(${search},pathEnd)+${searchLen};while(i${idx}!==${searchLen - 1}){const n=url.indexOf("&",i${idx});if(n===-1){${key}.push(${decodeValue ? `d(url,i${idx},length)` : `url.substring(i${idx})`});break;}${key}.push(${decodeValue ? `d(url,i${idx},n)` : `url.substring(i${idx},n)`});if(l${idx}===${maxItems - 1})break;i${idx}=url.indexOf(${search},n+1)+${searchLen};++l${idx};}`);
                        objParts.push(key);
                    }
                } else {
                    if (typeof maxItems === 'undefined' || maxItems < 2) {
                        idxChecks.push(`const s${idx}=url.indexOf(${search},pathEnd)+${searchLen};if(s${idx}===${searchLen - 1})return null;`);
                        valueChecks.push(`const i${idx}=url.indexOf("&",s${idx});const ${key}=i${idx}===-1?+url.substring(s${idx}):+url.substring(s${idx},i${idx});if(Number.isNaN(${key}))return null;`);
                        objParts.push(key);
                    } else {
                        idxs.push(`const ${key}=[];let l${idx}=0;let i${idx}=url.indexOf(${search},pathEnd)+${searchLen};while(i${idx}!==${searchLen - 1}){const n=url.indexOf("&",i${idx});if(n===-1){const v=+url.substring(i${idx});if(!Number.isNaN(v))${key}.push(v);break;}const v=+url.substring(i${idx},n);if(!Number.isNaN(v)){${key}.push(v);if(l${idx}===${maxItems - 1})break;}i${idx}=url.indexOf(${search},n+1)+${searchLen};++l${idx};}`);
                        objParts.push(key);
                    }
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
