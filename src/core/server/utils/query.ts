import { $pass } from '..';
import type { BaseContext } from '../types';

export const query: {
    /**
     * Get a single value of the key from the query
     */
    value(name: string): (ctx: BaseContext) => string | null;

    /**
     * Get multiple values of the key from the query
     */
    values(name: string, maxValues?: number): (ctx: BaseContext) => string[];

    /**
     * Get the query string from context
     */
    get(ctx: BaseContext): Record<string, string>;
} = {
    value: (name) => {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return $pass(Function(`return ({pathEnd,req:{url}})=>{const i=url.indexOf(${search},pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return n===-1?url.substring(i):url.substring(i,n);}`)());
    },

    values: (name, maxValues) => {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return $pass(Function(`return ({pathEnd,req:{url}})=>{const r=[];let i=url.indexOf(${search},pathEnd+1)+${searchLen};while(i!===${searchLen - 1}${typeof maxValues === 'number' ? `&&r.length<${maxValues}` : ''}){const n=url.indexOf("&",i);if(n===-1){r.push(url.substring(i));return r;}r.push(url.substring(i,n));i=url.indexOf(${search},n+1)}return r}`)());
    },

    get: $pass(({ pathEnd, req: { url } }) => {
        const { length } = url;
        if (length === pathEnd) return {};

        let startingIndex = pathEnd;
        let equalityIndex = startingIndex;

        let shouldDecodeKey = false;
        let shouldDecodeValue = false;

        const result: Record<string, string> = {};

        // Have a boundary of input.length + 1 to access last pair inside the loop.
        for (let i = startingIndex + 1; i < length; ++i)
            // Handle '&' and end of line to pass the current values to result
            switch (url.charCodeAt(i)) {
                case 38:
                    if (equalityIndex > startingIndex)
                        result[shouldDecodeKey
                            ? decodeURIComponent(url.substring(startingIndex + 1, equalityIndex))
                            : url.substring(startingIndex + 1, equalityIndex)
                        ] = shouldDecodeValue
                                ? decodeURIComponent(url.substring(equalityIndex + 1, i))
                                : url.substring(equalityIndex + 1, i);
                    else
                        result[shouldDecodeKey
                            ? decodeURIComponent(url.substring(startingIndex + 1, i))
                            : url.substring(startingIndex + 1, i)
                        ] = '';

                    startingIndex = i;
                    equalityIndex = i;

                    shouldDecodeKey = false;
                    shouldDecodeValue = false;
                    break;
                // Check '='
                case 61:
                    if (equalityIndex <= startingIndex) equalityIndex = i;
                    // If '=' character occurs again, we should decode the input.
                    else shouldDecodeValue = true;
                    break;
                // Check '%' character for encoding
                case 37:
                    if (equalityIndex > startingIndex) shouldDecodeValue = true;
                    else shouldDecodeKey = true;
                    break;
            }

        // Handle last KV pair
        if (equalityIndex > startingIndex)
            result[shouldDecodeKey
                ? decodeURIComponent(url.substring(startingIndex + 1, equalityIndex))
                : url.substring(startingIndex + 1, equalityIndex)
            ] = shouldDecodeValue
                    ? decodeURIComponent(url.substring(equalityIndex + 1))
                    : url.substring(equalityIndex + 1);
        else
            result[shouldDecodeKey
                ? decodeURIComponent(url.substring(startingIndex + 1))
                : url.substring(startingIndex + 1)
            ] = '';

        return result;
    })
};
