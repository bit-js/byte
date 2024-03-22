// Client
import { tester } from '@bit-js/byte';
import { jsonApis } from '@app';
import { test, expect } from 'bun:test';

const client = tester(jsonApis);

test('JSON', async () => {
    const res = await client.post('/json', {
        body: { message: 'Hi' }
    });
    expect(await res.json()).toEqual({
        message: 'Hi'
    });
});
