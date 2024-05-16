# Byte
A simple, performance-focused web framework that works on Bun, Deno, and browsers.
```ts
import { Byte } from '@bit-js/byte';

export default new Byte()
    .get('/', (ctx) => ctx.body('Hi'));
```

## Features
- **Fast**: Internally use [`Blitz`](//www.npmjs.com/package/@bit-js/blitz), the fastest router in the JS ecosystem.
- **Lightweight**: Under 30kB in size including dependencies.
- **Multi-runtime**: Works on all JS runtimes without any adapters.

## Benchmarks
Byte starts up faster than the `hono/quick` preset with LinearRouter.
```
[535.66ms] Byte: Build 1000 routes
[687.44ms] Hono: Build 1000 routes
```

Byte matches routes 6x faster than Hono with RegExpRouter.
```
"/user":
- Hono: 23416ns
- Byte: 4463ns

"/user/comments":
- Hono: 26255ns
- Byte: 4454ns

"/user/avatar":
- Hono: 31863ns
- Byte: 4991ns

"/event/:id":
- Hono: 33113ns
- Byte: 7072ns

"/event/:id/comments":
- Hono: 34888ns
- Byte: 8257ns

"/status":
- Hono: 26211ns
- Byte: 4195ns

"/deeply/nested/route/for/testing":
- Hono: 22171ns
- Byte: 3981ns
```

See [benchmarks](//github.com/bit-js/byte/tree/main/bench) for more details.

## Docs
See the docs at [bytejs.pages.dev](https://bytejs.pages.dev).
