import type { QueryParams } from '../types/requestProps';

export default function stringifyQuery(query?: QueryParams) {
  if (typeof query === 'undefined') return '';

  const parts = [];

  for (const key in query) {
    const value = query[key];

    if (value === false) continue;
    if (value === true) parts.push(encodeURIComponent(key));

    // Can only be array
    else if (typeof value === 'object') {
      const encodedKey = encodeURIComponent(key);

      for (let i = 0, { length } = value; i < length; ++i) parts.push(`${encodedKey}=${encodeURIComponent(`${value[i]}`)}`);
    } else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(`${value}`)}`);
  }

  return `?${parts.join('&')}`;
}
