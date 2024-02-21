// Client
import { bit } from '..';
import { app } from './app';
import { test, expect } from 'bun:test';

const server = Bun.serve(app);
const client = bit<typeof app>(server.url.href);

// Main testing
test('Root', async () => {
    const res = await client.get('/');
    expect(await res.text()).toBe('Hi');
});

test('Parameter', async () => {
    const res = await client.get('/user/:id', {
        params: { id: 90 }
    });
    expect(await res.text()).toBe('90');
});

