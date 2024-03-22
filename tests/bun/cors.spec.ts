import { test, expect } from 'bun:test';
import { tester } from '@bit-js/byte';
import { apiWithCors } from '@app';

const client = tester(apiWithCors);

test('CORS', async () => {
    const res = await client.get('/');

    expect(await res.text()).toBe('Hi');

    // CORS headers checking
    expect(res.headers.get('Access-Control-Allow-Origins')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET');
});
