import { group, run, bench } from 'mitata';
import { query, Context } from '../..';

const params = 'items=1&items=2&name=Reve&age=16&admin';
const ctx = new Context(new Request('http://localhost:3000/?' + params));

const parse = query.schema({
    items: { type: 'number', maxLength: 10 },
    name: { type: 'string' },
    age: { type: 'number' },
    admin: { type: 'bool' }
});
console.log(parse.toString());

group('Query parsing', () => {
    bench('Schema', () => {
        const o = parse(ctx);
        return `${o.items.join()} ${o.name} ${o.age} ${o.admin}`;
    });

    bench('URLSearchParams', () => {
        const params = new URLSearchParams(ctx.req.url.substring(ctx.pathEnd + 1));
        return `${params.getAll('items').join()} ${params.get('name')} ${+params.get('age')} ${params.has('admin')}`;
    });
});

run();
