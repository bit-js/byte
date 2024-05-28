import { test, expect, spyOn } from 'bun:test';
import { apiWithDefers } from '@app';

const client = apiWithDefers.client();

test('Defers', async () => {
    const timeSpy = spyOn(console, 'timeEnd');

    const res = await client.get('/');
    expect(await res.text()).toBe('Hi');

    // CORS headers checking
    expect(timeSpy).toHaveBeenCalledWith('/');
});

