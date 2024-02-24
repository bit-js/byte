# Byte
A simple, performance-focused framework that works everywhere.

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

### Validators
Validators are functions that parse and validate incoming request data.
```ts
new Byte()
    .get('/', {
        body: async ctx => {
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

## Runtime support
Byte should work on all runtimes as it doesn't use any runtime-specific APIs.

If Byte does not work on any runtime please open an issue at https://github.com/bit-js/byte/issues.
