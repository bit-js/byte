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
} = {
    value: (name) => {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return Function(`return (c)=>{const {url}=c.req;const i=url.indexOf(${search},c.pathEnd+1)+${searchLen};if(i===${searchLen - 1})return null;const n=url.indexOf("&",i);return n===-1?url.substring(i):url.substring(i,n);}`)();
    },

    values: (name, maxValues) => {
        const search = JSON.stringify(encodeURIComponent(name) + '=');
        const searchLen = search.length - 2;

        return Function(`return (c)=>{const {url}=c.req;const r=[];let i=url.indexOf(${search},c.pathEnd+1)+${searchLen};while(i!===${searchLen - 1}${typeof maxValues === 'number' ? `&&r.length<${maxValues}` : ''}){const n=url.indexOf("&",i);if(n===-1){r.push(url.substring(i));return r;}r.push(url.substring(i,n));i=url.indexOf(${search},n+1)}return r}`)();
    },
};
