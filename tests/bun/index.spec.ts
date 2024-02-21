// Client
import { type App, fetch } from '../app';
import createClient from './createClient';

import { test, expect } from 'bun:test';

const client = createClient<App>({ fetch, port: 3000 });

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
