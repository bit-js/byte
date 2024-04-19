import { test, expect } from 'bun:test';
import { timingApi } from '@app';

const client = timingApi.client();

test('Server timing', async () => {
    const res = await client.get('/');

    // Headers checking
    expect(res.headers.get('Server-Timing')).toStartWith('createUUID;desc="Create a random UUID v4";dur=');
});
