const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
const charactersLength = characters.length;
const routesCount = 500;

// Make everything as random as possible
function makePart() {
    const result = [];
    const length = 2 + Math.round(Math.random() * 16);

    for (let cnt = 0; cnt < length; ++cnt)
        result.push(characters[Math.floor(Math.random() * charactersLength)]);

    return result.join('');
}

function makePath(idx) {
    const parts = new Array(routesCount);
    for (let i = 0; i < routesCount; ++i)
        parts[i] = makePart();

    // Put URL params randomly to force the paths to be registered on the radix tree
    parts[idx] = `:${parts[idx]}`;
    return `/${parts.join('/')}`;
}

const content = [
    'import { Byte, send } from "../.."',
    'performance.mark("Build start")',
    'const { fetch } = new Byte()'
];

for (let i = 0; i < routesCount; ++i)
    content.push(`\t.get('${makePath(i)}', () => send.body("${Math.random()}"))`);

content.push('performance.mark("Build end")');
content.push('console.log(fetch.toString())');
content.push(`console.log(performance.measure("Build ${routesCount} routes", "Build start", "Build end"))`);

Bun.write(import.meta.dir + '/index.js', content.join('\n'));

