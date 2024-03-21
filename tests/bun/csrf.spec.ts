import { test, expect } from 'bun:test';
import listen from './listen';
import { apiWithCsrf } from '@app';

const client = listen(apiWithCsrf);

test('CSRF', async () => {
    const res = await client.get('/');

    expect(res.status).toBe(403);
});
