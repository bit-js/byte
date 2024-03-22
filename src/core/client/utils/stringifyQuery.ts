export default function stringifyQuery(query: Record<string, string | number | boolean> | undefined) {
    if (typeof query == 'undefined') return '';

    const parts = [];

    for (const key in query) {
        if (query[key] === false) continue;
        parts.push(query[key] === true ? encodeURIComponent(key) : `${encodeURIComponent(key)}=${encodeURIComponent(query[key].toString())}`);
    }

    return `?${parts.join('&')}`;
}
