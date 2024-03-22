// Client
import { jsonApis } from '@app';
import { test, expect } from 'bun:test';

const client = jsonApis.client();

test('JSON', async () => {
    const res = await client.post('/json', {
        body: { message: 'Hi' }
    });
    expect(await res.json()).toEqual({
        message: 'Hi'
    });
});
