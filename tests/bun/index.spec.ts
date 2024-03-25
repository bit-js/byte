// Client
import { basicApis } from '@app';
import { test, expect } from 'bun:test';

const client = basicApis.client();

// Main testing
test('Root', async () => {
    const res = await client.get('/');
    expect(await res.text()).toBe('Hi');
});

test('Parameter', async () => {
    const res = await client.get('/:id', {
        params: { id: 90 }
    });
    expect(await res.text()).toBe('90');
});

test('Query', async () => {
    const query = { id: 16, darkMode: true, name: 'Reve' };
    const res = await client.get('/user', { query });
    expect(await res.json()).toEqual(query);
});
