import { group, run, bench } from 'mitata';

const AsyncFunction = async function() { }.constructor;
for (let i = 0; i < 15; ++i) bench('noop', () => { });

const f1 = () => Promise.resolve(0);

const f2 = async () => Promise.resolve(0);

const f3 = async () => await Promise.resolve(0);

const f4 = () => Promise.resolve(0);
f4.constructor = AsyncFunction;

group('Async function testing', () => {
    bench('No async', async () => {
        await f1();
    });

    bench('Fake async', async () => {
        await f4();
    });

    bench('Async no await', async () => {
        await f2();
    });

    bench('Async await', async () => {
        await f3();
    });
});

run();
