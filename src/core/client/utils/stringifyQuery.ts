import type { QueryParams } from '../types/requestProps';

export default function stringifyQuery(query?: QueryParams) {
    if (typeof query == 'undefined') return '';

    const parts = [];

    for (const key in query) {
        const value = query[key];

        if (value === false) continue;
        if (value === true) parts.push(encodeURIComponent(key));
        else if (Array.isArray(value)) {
            const encoded = encodeURIComponent(key);
            for (let i = 0, { length } = value; i < length; ++i)
                parts.push(`${encoded}=${encodeURIComponent(value[i].toString())}`);
        }
        else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
    }

    return `?${parts.join('&')}`;
}
