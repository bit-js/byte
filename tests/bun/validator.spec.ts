// Client
import { jsonApis } from '@app';
import { test, expect } from 'bun:test';

const client = jsonApis.client();

test('JSON', async () => {
    const body = { message: 'Hi' };

    const res = await client.post('/json', { body });
    expect(await res.json()).toEqual(body);
});
