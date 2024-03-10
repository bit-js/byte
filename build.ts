/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';
import pkg from './package.json';

// Generating types
const dir = './types';
if (existsSync(dir)) rmSync(dir, { recursive: true });

Bun.spawn(['bun', 'x', 'tsc'], {
    stdout: 'inherit',
    stderr: 'inherit'
});

Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: '.',
    entrypoints: ['./src/index.ts'],
    minify: {
        whitespace: true
    },
    external: Object.keys(pkg.dependencies)
});

