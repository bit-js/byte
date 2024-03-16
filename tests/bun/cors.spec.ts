import { test, expect } from 'bun:test';
import listen from './listen';
import { apiWithCors } from '@app';

const client = listen(apiWithCors, 3002);

test('CORS', async () => {
    const res = await client.get('/');

    expect(await res.text()).toBe('Hi');
    expect(res.headers.get('Access-Control-Allow-Origins')).toBe('*');
});
