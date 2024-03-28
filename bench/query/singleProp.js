import { group, run, bench } from 'mitata';
import { query, Context } from '../..';
import { optimizeNextInvocation } from 'bun:jsc';

const params = 'id=1&name=Reve&age=16&admin';
const ctx = new Context(new Request('http://localhost:3000/?' + params));
const search = new URLSearchParams(ctx.req.url.substring(ctx.pathEnd + 1));

const parse = query.get('name');
console.log(parse.toString());

parse(ctx);
optimizeNextInvocation(parse);

group('Query parsing', () => {
    bench('Schema', () => parse(ctx));
    bench('URLSearchParams', () => search.get('name'));
});

run();

