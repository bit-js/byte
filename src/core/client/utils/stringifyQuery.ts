import type { QueryParams } from '../types/requestProps';

export default function stringifyQuery(query?: QueryParams) {
  if (typeof query === 'undefined') return '';

  const parts = [];

  for (const key in query) {
    const value = query[key];

    switch (typeof value) {
      case 'boolean':
        if (value) parts.push(encodeURIComponent(key));
        continue;

      case 'object':
        const encodedKey = encodeURIComponent(key);
        for (let i = 0, { length } = value; i < length; ++i) parts.push(`${encodedKey}=${encodeURIComponent(`${value[i]}`)}`);
        continue;

      default:
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(`${value}`)}`);
        continue;
    }
  }

  return `?${parts.join('&')}`;
}
