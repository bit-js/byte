import Byte from '../src';
import bit from '../src/client';

import { test, expect } from 'bun:test';

// Create a simple app
const app = new Byte()
    .get('/user', () => 'Hi')
    .get('/user/:id', ctx => ctx.params.id)
    .get('/user/:id/info', ctx => ctx.params);

const server = Bun.serve(app);

// E2E testing
const client = bit<typeof app>(server.url.href);

// Normal text response
test('Text', async () => {
    const res = await client.user.get();

    expect(await res.text()).toBe('Hi');
});

// With parameters
test('Params', async () => {
    const res = await client.user.$id.get({
        params: { id: 90 }
    });

    expect(await res.text()).toBe('90');
});

// With JSON
test('JSON', async () => {
    const res = await client.user.$id.info.get({
        params: { id: 90 }
    });

    expect(await res.json()).toEqual({ id: '90' });
})
