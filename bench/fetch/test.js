import { group, run, bench } from 'mitata';

const routes = {
    '/user': () => 'User',
    '/user/comments': () => 'User comments',
    '/user/avatar': () => 'User avatar',
    '/event/:id': (params) => `Event ${params.id}`,
    '/event/:id/comments': (params) => `Event ${params.id} comments`,
    '/status': () => 'Status',
    '/deeply/nested/route/for/testing': () => 'Deeply nested route for testing'
};

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

function randomValue() {
    const result = new Array(10);

    for (let i = 0; i < 10; ++i)
        result[i] = characters[Math.floor(Math.random() * charactersLength)];

    return result.join('');
}

// Generate random params and inject into the path
function buildPath(path) {
    const parts = [], params = {};

    let paramIdx = path.indexOf(':'), start = 0;
    while (paramIdx !== -1) {
        if (paramIdx !== start)
            parts.push(path.substring(start, paramIdx));

        ++paramIdx;
        start = path.indexOf('/', paramIdx);

        const value = randomValue();
        parts.push(value);

        if (start === -1) {
            params[path.substring(paramIdx)] = value;
            return { path: parts.join(''), params };
        }

        params[path.substring(paramIdx, start)] = value;
        paramIdx = path.indexOf(':', start + 1);
    };

    parts.push(path.substring(start));
    return { path: parts.join(''), params };
}

export async function check(res, expect) {
    if (await (await res).text() !== expect) throw new Error('A framework failed the test');
}

const built = {};
for (const path in routes)
    built[path] = buildPath(path);

export default function test(frameworks) {
    for (let i = 0; i < 15; ++i) bench('noop', () => { });

    for (const path in routes) {
        const buildResult = built[path];
        const req = new Request('http://localhost' + buildResult.path);

        group(path, () => {
            for (const label in frameworks) {
                const fn = frameworks[label];

                check(fn(req), routes[path](buildResult.params));
                console.log(fn.toString());

                bench(label, () => fn(req));
            }
        });
    }

    return run({
        silent: true,
        json: true
    });
}
