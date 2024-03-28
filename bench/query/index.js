import { group, run, bench } from 'mitata';
import { query, Context } from '../..';

const params = 'id=1&name=Reve&age=16&admin';
const ctx = new Context(new Request('http://localhost:3000/?' + params));

const parse = query.schema({
    id: 'number',
    name: 'string',
    age: 'number',
    admin: 'bool'
});
console.log(parse.toString());

group('Query parsing', () => {
    bench('Schema', () => {
        const o = parse(ctx);
        return `${o.id} ${o.name} ${o.age} ${o.admin}`;
    });

    bench('URLSearchParams', () => {
        const params = new URLSearchParams(ctx.req.url.substring(ctx.pathEnd + 1));
        return `${+params.get('id')} ${params.get('name')} ${+params.get('age')} ${params.has('admin')}`;
    });
});

run();
