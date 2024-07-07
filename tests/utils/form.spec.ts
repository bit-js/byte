import { form, Context } from '@bit-js/byte';
import { expect, test } from 'bun:test';

function context(obj: Record<string, any>) {
  const body = new FormData();

  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value)) {
      for (let i = 0, { length } = value; i < length; ++i) {
        const item = value[i];

        body.append(key, typeof item === 'string' || item instanceof File ? item : item + '');
      }
    } else if (typeof value === 'boolean') {
      if (value)
        body.append(key, '');
    } else body.append(key, typeof value === 'string' || value instanceof File ? value : value + '');
  }

  return new Context(new Request('http://localhost:3000', {
    method: 'POST', body
  }))
}

test('Form getters', async () => {
  const parseStr = form.get('name', { type: 'string' });
  expect(await parseStr(context({ name: 'a' }))).toBe('a');
  expect(await parseStr(context({ age: 16 }))).toBe(null);

  const parseNum = form.get('id', { type: 'number' });
  expect(await parseNum(context({ id: 0 }))).toBe(0);
  expect(await parseNum(context({ id: 'str' }))).toBe(null);


  const parseBool = form.get('darkMode', { type: 'bool' });
  expect(await parseBool(context({ darkMode: '' }))).toBe(true);
  expect(await parseBool(context({ other: '' }))).toBe(false);
});

test('Form schema', async () => {
  const parseForm = form.schema({
    name: { type: 'string' },
    age: { type: 'number' },
    darkMode: { type: 'bool' },
    ids: { type: 'number', multipleItems: true }
  });

  const o1 = {
    name: 'dave',
    age: 18,
    darkMode: true,
    ids: [5, 6]
  };
  expect(await parseForm(context(o1))).toEqual(o1);
});
