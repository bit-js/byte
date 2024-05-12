import { query, Context, stringifyQuery } from '@bit-js/byte';
import { expect, test } from 'bun:test';

const q = {
    name: 'Item',
    id: 1,
    category: ['a', 'b', 'c'],
    rate: [4, 5, 6],
    darkMode: true
};

const ctx = new Context(new Request('http://localhost:3000/' + stringifyQuery(q)));

test('Query getters', () => {
    const getName = query.get('name');
    expect(getName(ctx)).toBe(q.name);

    const getCats = query.get('category', {
        type: 'string',
        maxItems: 10
    });
    expect(getCats(ctx)).toEqual(q.category);

    const getRates = query.get('rate', {
        type: 'number',
        maxItems: 10
    });
    expect(getRates(ctx)).toEqual(q.rate);

    const getID = query.get('id', { type: 'number' });
    expect(getID(ctx)).toBe(q.id);

    const isDarkMode = query.get('darkMode', { type: 'bool' });
    expect(isDarkMode(ctx)).toBe(q.darkMode);
});

test('Query schema', () => {
    const parse = query.schema({
        name: { type: 'string' },
        id: { type: 'number' },
        darkMode: { type: 'bool' },
        category: {
            type: 'string',
            maxItems: 10
        },
        rate: {
            type: 'number',
            maxItems: 10
        }
    });
    expect(q).toMatchObject(parse(ctx)!);
});
