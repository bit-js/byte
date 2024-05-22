// Server
import { Byte, parse, cors, csrf, send } from '@bit-js/byte';

// Basic responses
export const basicApis = new Byte()
    .get('/', send.body('Hi'))
    .get('/:id', (ctx) => ctx.body(ctx.params.id));

// Parse & send JSON
export const jsonApis = new Byte()
    .post('/json', {
        body: parse.json()
    }, (ctx) => ctx.json(ctx.state.body));

// CORS
export const apiWithCors = new Byte()
    .use(cors({ allowMethods: 'GET' }))
    .get('/', (ctx) => ctx.body('Hi'));

// CSRF protection
export const apiWithCsrf = new Byte()
    .use(csrf())
    .get('/', send.body('Hi'));

// Alters
export const apiWithAlters = new Byte()
    .use((ctx) => console.time(ctx.path))
    .alter((res, ctx) => {
        // You should change the response here
        console.log(res.ok);
        console.timeEnd(ctx.path);
    })
    .get('/', send.body('Hi'));
