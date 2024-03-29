# Byte
A simple, performance-focused web framework that works on Bun, Deno, Cloudflare Workers and browsers.
```ts
import { Byte, send } from '@bit-js/byte';

export default new Byte()
    .get('/', () => send.body('Hi'));
```

## Features
- **Fast**: Internally use [`Blitz`](//www.npmjs.com/package/@bit-js/blitz), the fastest router in the JS ecosystem.
- **Lightweight**: Under 30kB in size including dependencies.
- **Multi-runtime**: Works on all JS runtimes without any adapters.

## Benchmarks
Byte starts up 2x faster than Hono with LinearRouter.
```
[36.23ms] Byte: Build 10000 routes
[89.89ms] Hono: Build 10000 routes
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

See [benchmarks](./bench) for more details.

## Concepts
All the basics you need to know to use Byte.

### Context
Context is an object represents the current request.
- `ctx.path`: The parsed request pathname, doesn't have a slash at the start.
- `ctx.pathStart`: The start index of the pathname in the full URL string (`req.url`). This property can be useful for subdomain matching.
- `ctx.pathEnd`: The end index of the path. When query parameters are presented, path end is set to the start of the query, otherwise it is set to the length of the URL.
- `ctx.params`: The parsed URL parameters. Defaults to `undefined` with static routes.
- `ctx.state`: This property stores validators result. Defaults to `undefined` with routes that have no validators.
- `ctx.req`: The original request object.

### Handler
Handlers are functions that accepts the request context as parameter and return a `Response` object.
```ts
() => new Response('Hi');
(ctx) => new Response(ctx.params.id);
```

If your handler doesn't use the request context, in certain cases the router compiler will optimize the matcher to not pass in the request context as a parameter.

### Defining routes
You can define routes with the syntax `method(path, handler)`.
```ts
new Byte()
    // Handle GET method 
    .get('/', () => new Response('Hi'))
    // Handle PUT method
    .put('/user/:id', (ctx) => new Response(ctx.params.id))
    // Handle all request method
    .any('/*', () => new Response('Not found'));
```

### Route patterns
Parametric and wildcard patterns are supported.
```ts
'/:id' // Only one parameter
'/user/:id/name/:name' // Multiple parameter
'/nav/*' // Wildcard parameter
'/user/:id/*' // All patterns combined
```

Like other frameworks, Byte passes the parsed parameter values to `ctx.params`, but wildcard parameter is named `$` instead of `*`.

### Fallback
Use `fallback` to handle the request when the path does not match any registed route.
```ts
new Byte()
    // Normal route
    .get('/', () => new Response('Hi'))
    // Fallback when all routes do not match
    .fallback((ctx) => new Response(ctx.path));
```

### Validators
Validators are functions that parse and validate incoming request data.
```ts
new Byte()
    .get('/', {
        body: async (ctx) => {
            try {
                // Parse body as text
                return await ctx.req.text();
            } catch (_) {
                // Return a response directly
                return new Response('Something went wrong');
            }
        }
    }, ctx => new Response(ctx.state.body));
```

Parsed data is passed into `ctx.state` as a property and can be used in the request handler.

If a `Response` object is returned from the validator, it will be used instead of the handler response.

If the validator returns a `Promise` it should be properly marked as `async` for the compiler to detect.

The validator name **must** be a valid JavaScript variable name.

### Actions
Actions are functions that executes before validators.
```ts
new Byte()
    .action((ctx) => {
        // Preparations
    })
    .action((ctx) => {
        // Do something else
    });
```

If a `Response` object is returned from any action function, it will be used directly.

### Plugins
Plugins are objects with a `plug()` function that modify the app instance.
```ts
import type { Plugin } from '@bit-js/byte';

const plugin = {
    plug(app) {
        // Do something with the app instance
        // Route types are not preserved
        // You should not add route handlers
    };
};

new Byte().use(plugin);
```

Plugins are meant to be used by third party libraries to add functionalities.

### Fetch
To obtain the `fetch` handler:
```ts
app.fetch;
```

To rebuild the fetch function:
```ts
app.rebuild();
```

### Client
Byte provides a client implementation with route type inference.

To use it, first export the type of your app.
```ts
const app = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/user/:id', (ctx) => send.body(ctx.params.id))
    .post('/text', {
        body: async ctx => await ctx.req.text()
    }, (ctx) => send.body(ctx.state.body))

export type App = typeof app;
```

Then use it in client code.
```ts
import type { App } from './app';
import { bit } from '@bit-js/byte';

const app = bit<App>('http://localhost:3000');

const msg = await app.get('/'); 
await msg.text(); // 'Hi'

const id = await app.get('/user/:id', {
    params: { id: 90 }
});
await msg.text(); // '90'

const body = await app.post('/text', {
    body: 'Hi'
});
await body.text(); // 'Hi'
```

You can also pass in a custom `fetch` function which accepts a `Request` object and returns a `Promise<Response>` object.
```ts
bit<App>('http://localhost:3000', { fetch: myFetch });
```

To set default request options.
```ts
bit<App>('http://localhost:3000', { 
    // RequestInit
    init: { keepalive: true }
});
```

#### Unit testing
Use this client for server-side unit testing only.
```ts
import server from './server';

// This loads server-side code
const app = server.client();

// Use like Bit client
const res = await app.get('/');
```

Only one test client should be created for each `Byte` instance.

## Utilities

### Sending response
Response utilities should be used for client type inference.
```ts
import { send } from '@bit-js/byte';

// new Response('Hi')
send.body('Hi'); 

// new Response('Hi', { headers: { 'Content-Type': 'text/plain' } })
send.text('Hi'): 

// new Response(JSON.stringify({ hello: 'world' }), { headers: { 'Content-Type': 'application/json' } })
send.json({ hello: 'world' });

// new Response(null, { headers: { Location: '/home' }, status: 302 })
send.link('/home', 302);

// SSE
send.events(readable);
```

All response utilities (except `send.link`) accepts a response body and a `ResponseInit` object.
```ts
send(body: any, init?: ResponseInit): any;
```

If a `ResponseInit` is passed in it will be merged with the corresponding headers.
```ts
// You should cache the header if it is static
send.body('Not found', { status: 404 });
```

### Body parsers
Use body parsers to parse request body and handle errors.
```ts
import { parse } from '@bit-js/byte';

app.post('/text', {
    body: parse.text({
        // Do parsing with request body if specified
        then(data) {
            // If a `Response` object is returned.
            // It will be used instead of the handler response.
        },

        // Handle error if specified
        catch(error) {
            // Should return a Response or Promise<Response>
            // You can omit this and use the native error handler depending on the JS runtime
        }
    })
});
```

Available parsers are:
- `parse.text`: Parse request body as text.
- `parse.json`: Parse request body as JSON.
- `parse.blob`: Parse request body as `Blob`.
- `parse.form`: Parse request body as `FormData`.
- `parse.buffer`: Parse request body as `ArrayBuffer`.

### Query parsers
Use query parsers to get parameter values out of a query string.
```ts
import { query } from '@bit-js/byte';

// Get the first value of parameter 'id' from query as a string
query.get('id'); // parse to string or null if parameter does not exist

// Get the first value of parameter 'id' from query as a number
query.get('id', { type: 'number' }); // parse to number or NaN

// Get a multiple values of parameter 'category' from query
query.get('category', {
    // Value type
    type: 'string',

    // Maximum values to obtain
    maxLength: 10
}); // parse to string[]

// Check whether 'darkMode' parameter exists
// 'maxValues' is ignored if specified with type 'bool'
query.get('darkMode', { type: 'bool' }); // parse to boolean

// Create a parser with a schema
query.schema({
    name: { type: 'string' },
    age: { type: 'number' },
    items: { type: 'number', maxLength: 10 },
    darkMode: { type: 'bool' },
}); // parse to { name: string, age: number, items: number[], darkMode: boolean } or null if any parameter does not match
```

All query parsers return a function to parse query parameters from a request context.
```ts
(ctx: BaseContext) => any;
```

The results get decoded using a custom `decodeURIComponent` implementation by default. To disable this behavior set `query.decodeValue` to `false`.

You can manually decode a value using `query.decode`.
```ts
// Works like decodeURIComponent but it returns the original string if the string is invalid
query.decode(str);
```

### CORS
Set CORS headers on every requests.
```ts
import { cors } from '@bit-js/byte';

// Allow all origins
app.action(cors());

// Custom options
app.action(cors(options));
```

Available options are:
```ts
interface CORSOptions {
    allowOrigin?: string; // Defaults to '*'
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    maxAge?: number;
    allowCredentials?: boolean;
    allowHeaders?: string | string[];
}
```

### CSRF
A simple CSRF protection layer by checking request origin.
```ts
import { csrf } from '@bit-js/byte';

// Check with current request URL origin
app.action(csrf());

// Custom options
app.action(csrf(options));
```

Available options are:
```ts
interface CSRFOptions {
    origins?: string;
    verify?: (origin: string) => boolean;
    fallback?: (ctx: BaseContext) => any;
}
```

### Timing
A `Server-Timing` helper.
```ts
import { timing } from "@bit-js/byte";

// Create a timing schema
const Metrics = timing({
    // With description
    db: 'Measure database queries',

    // No description
    id: null
});

// Use in requests
app.get('/users', (ctx) => {
    const metrics = new Metrics();

    // Start measuring
    metrics.start('db');
    const result = queryFromDatabase(ctx);
    metrics.end('db');

    // Set `Server-Timing` header
    metrics.set(ctx);

    // Send the measured result
    return send.body(metrics.db.toString(), ctx);
});
```

### Other utils
Check out [`@bit-js/web-utils`](//www.npmjs.com/package/@bit-js/web-utils), a performance-focused web utilities library for all runtimes.
