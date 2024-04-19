import { test, expect } from 'bun:test';
import { apiWithCsrf } from '@app';

const client = apiWithCsrf.client();

test('CSRF', async () => {
    const res = await client.get('/');

    expect(res.status).toBe(403);
});
