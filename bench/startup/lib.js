import { $ } from 'bun';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
const charactersLength = characters.length;
export const routesCount = 100;

// Make everything as random as possible
function makePart() {
    const result = [];
    const length = 2 + Math.round(Math.random() * 16);

    for (let cnt = 0; cnt < length; ++cnt)
        result.push(characters[Math.floor(Math.random() * charactersLength)]);

    return result.join('');
}

export function makePath(idx) {
    const parts = new Array(routesCount);
    for (let i = 0; i < routesCount; ++i)
        parts[i] = makePart();

    // Put URL params randomly to force the paths to be registered on the radix tree
    parts[idx] = `:${parts[idx]}`;
    return `/${parts.join('/')}`;
}

export const routes = new Array(routesCount);
for (let i = 0; i < routesCount; ++i)
    routes[i] = { part: makePart(i), value: `"${Math.random()}"` };

export async function exec(name, content, chain) {
    for (let i = 0; i < routesCount; ++i)
        content.push(chain(routes[i]));

    content.push('fetch(new Request("http://localhost:3000"))')
    content.push('performance.mark("Build end")');
    content.push('console.log(fetch.toString())');
    content.push(`console.log(performance.measure("${name}: Build ${routesCount} routes", "Build start", "Build end"))`);

    const path = `./dist/${name}.js`;

    await Bun.write(path, content.join('\n'));
    await $`bun run ${path}`;
}
