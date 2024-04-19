import { group, run, bench } from 'mitata';

const list = ['str', Math.round(Math.random() * 16), false, true];

group('Stringify', () => {
    const toStr = (v) => v.toString();
    bench('toString', () => list.map(toStr));

    const templateStr = (v) => `${v}`;
    bench('Template string', () => list.map(templateStr));
});

run();

