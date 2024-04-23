const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
const charactersLength = characters.length;
export const routesCount = 1e4;

// Make everything as random as possible
function makePart() {
    const result = [];
    const length = 2 + Math.round(Math.random() * 16);

    for (let cnt = 0; cnt < length; ++cnt)
        result.push(characters[Math.floor(Math.random() * charactersLength)]);

    return `/${result.join('')}`;
}

export function makePath(idx) {
    const parts = new Array(routesCount);
    for (let i = 0; i < routesCount; ++i)
        parts[i] = makePart();

    // Put URL params randomly to force the paths to be registered on the radix tree
    parts[idx] = `/:${parts[idx].substring(1)}`;
    return parts.join('');
}

const routes = new Array(routesCount);
for (let i = 0; i < routesCount; ++i)
    routes[i] = { part: makePart(i), value: `"${Math.random()}"` };

export async function exec(name, content, chain) {
    const path = `./dist/${name}.js`;

    if (process.argv[2] !== 'test') {
        content.unshift(`console.time("${name}: Build ${routesCount} routes")`);

        for (let i = 0; i < routesCount; ++i)
            content.push(chain(routes[i]));

        if (!name.startsWith('blitz')) content.push('app.fetch(new Request("http://localhost:3000"))');
        else content.push('app.build()');

        content.push(`console.timeEnd("${name}: Build ${routesCount} routes")`);
        await Bun.write(path, content.join('\n'));
    }

    Bun.spawn(['bun', 'run', path], {
        stdout: 'inherit'
    });
}

