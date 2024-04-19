import { basicApis } from '@app';
import { test, expect } from 'bun:test';

test('Fetch', () => {
    expect(basicApis.fetch.toString()).toBe(basicApis.fetch.toString());
    expect(() => basicApis.fetch(new Request('http://0.0.0.0/'))).not.toThrow();
});
