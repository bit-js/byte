import { makePath, routesCount } from '../lib';

const content = [
    'import { Elysia } from "elysia"',
    'performance.mark("Build start")',
    'const { fetch } = new Elysia()'
];

for (let i = 0; i < routesCount; ++i)
    content.push(`\t.get('${makePath(i)}', "${Math.random()}")`);

content.push('fetch(new Request("http://localhost:3000"))')
content.push('performance.mark("Build end")');
content.push('console.log(fetch.toString())');
content.push(`console.log(performance.measure("Build ${routesCount} routes", "Build start", "Build end"))`);

Bun.write(import.meta.dir + '/index.js', content.join('\n'));


