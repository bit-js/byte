import { join } from 'path';

const target = process.argv[2];
if (typeof target === 'undefined')
    throw new Error('Must specify a target framework to continue!');

Bun.spawnSync(['bun', 'run', join(import.meta.dir, target, 'codegen.js')]);

const proc = Bun.spawnSync(['bun', 'run', join(import.meta.dir, target, 'index.js')]);
console.log(proc.stdout.toString());
