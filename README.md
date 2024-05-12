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
Byte starts up 1.5x faster than Hono with LinearRouter.
```
[446.37ms] Byte: Build 1000 routes
[635.84ms] Hono: Build 1000 routes
```

Byte matches routes 5x faster than Hono with RegExpRouter.
```
"/user":
- Hono: 5377ns
- Byte: 1064ns

"/user/comments":
- Hono: 5289ns
- Byte: 1103ns

"/user/avatar":
- Hono: 5153ns
- Byte: 1082ns

"/event/:id":
- Hono: 5792ns
- Byte: 1455ns

"/event/:id/comments":
- Hono: 5726ns
- Byte: 1631ns

"/status":
- Hono: 5358ns
- Byte: 1036ns

"/deeply/nested/route/for/testing":
- Hono: 5253ns
- Byte: 1047ns
```

See [benchmarks](//github.com/bit-js/byte/tree/main/bench) for more details.

## Docs
See the docs at [bytejs.pages.dev](https://bytejs.pages.dev).
