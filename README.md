# Byte
A simple, performance-focused web framework that works on Bun, Deno, Cloudflare Workers and browsers.
```ts
import { Byte, send } from '@bit-js/byte';

export default new Byte()
    .get('/', () => send.body('Hi'));
```

## Concepts

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

Like other frameworks, Byte pass the parsed parameter values to `ctx.params`, but wildcard parameter is named `$` instead of `*`.

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

Parsed data is passed into `ctx.state` as a property.

If a `Response` object is returned from the validator, it will be used instead of the handler response.

If the function returns a `Promise` it should be properly marked as `async` for the compiler to detect.

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
And before you ask why there is no 

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

### Client
Byte provides a client implementation with type inference.

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
await body.text(); // Hi
```

You can also pass in a custom `fetch` function.
```ts
const app = bit<App>('http://localhost:3000', myFetch);
```

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
send.json({ hello: world });

// new Response(null, { headers: { Location: '/home' }, status: 302 })
send.link('/home', 302);

// SSE
send.events(readable);
```

All response utilities (except `send.link`) has two arguments.
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

// getID(ctx) -> Get a single value of parameter 'id' from query
// Return null if parameter does not exist in query string
const getID = query.value('id'); // string | null

// getCats(ctx) -> Get a multiple values of parameter 'category' from query
const getCats = query.values('category'); // string[]

// Parse query to key-value pair
const result = query.get(ctx);
```

The query parser utils do not `decodeURLComponent` the result by default.
