import { apiWithSet } from '@app';
import { test, expect } from 'bun:test';

const client = apiWithSet.client();

test('Set', async () => {
  const res = await client.get('/');
  expect(+await res.text()).not.toBeNaN();
});
