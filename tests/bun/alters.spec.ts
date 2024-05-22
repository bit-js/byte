import { test, expect, spyOn } from 'bun:test';
import { apiWithAlters } from '@app';

const client = apiWithAlters.client();

test('Alters', async () => {
    const timeSpy = spyOn(console, 'timeEnd')

    const res = await client.get('/');
    expect(await res.text()).toBe('Hi');

    // CORS headers checking
    expect(timeSpy).toHaveBeenCalledWith('/');
});

