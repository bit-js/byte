import path from 'path';

Bun.build({
    entrypoints: [
        path.join(import.meta.dir, 'index.ts'),
        path.join(import.meta.dir, 'register.ts')
    ],
    outdir: path.join(import.meta.dir, 'serve/dist'),
});
