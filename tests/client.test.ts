import bit from '../src/client';
import app from './app';

import { test, expect } from 'bun:test';

// Load the app here
Bun.serve(app);

// E2E testing
const client = bit<typeof app>('http://localhost:3000');

// Normal text response
test('Text', async () => {
    const res = await client.get();

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
    const res = await client.json.post({
        body: { a: 'b' }
    });

    expect(await res.json()).toEqual({ a: 'b' });
});
