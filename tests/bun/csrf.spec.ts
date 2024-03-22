import { test, expect } from 'bun:test';
import { tester } from '@bit-js/byte';
import { apiWithCsrf } from '@app';

const client = tester(apiWithCsrf);

test('CSRF', async () => {
    const res = await client.get('/');

    expect(res.status).toBe(403);
});
