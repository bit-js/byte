import { group, run, bench } from 'mitata';

for (let i = 0; i < 15; ++i) bench('noop', () => { });

const thenFn = a => a + Math.random();

const f1 = () => Promise.resolve(0).then(thenFn);

const f2 = async () => thenFn(await Promise.resolve(0));

group('Async function testing', () => {
    bench('No async', async () => {
        await f1();
    });

    bench('Async await', async () => {
        await f2();
    });
});

run();
