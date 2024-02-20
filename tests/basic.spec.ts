// Client
import { bit } from '..';
import type app from './app';

import { test, expect } from 'bun:test';

const client = bit<typeof app>('http://localhost:3000');

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

