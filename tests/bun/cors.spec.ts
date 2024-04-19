import { test, expect } from 'bun:test';
import { apiWithCors } from '@app';

const client = apiWithCors.client();

test('CORS', async () => {
    const res = await client.get('/');

    expect(await res.text()).toBe('Hi');

    // CORS headers checking
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
});
