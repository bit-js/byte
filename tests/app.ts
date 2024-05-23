// Server
import { Byte, cors, csrf, send } from '@bit-js/byte';

// Basic responses
export const basicApis = new Byte()
    .get('/', send.body('Hi'))
    .get('/:id', (ctx) => ctx.body(ctx.params.id));

// Parse & send JSON
export const jsonApis = new Byte()
    .post('/json', async (ctx) => ctx.json(await ctx.req.json()));

// CORS
export const apiWithCors = new Byte()
    .use(cors({ allowMethods: 'GET' }))
    .get('/', (ctx) => ctx.body('Hi'));

// CSRF protection
export const apiWithCsrf = new Byte()
    .use(csrf())
    .get('/', send.body('Hi'));

// Alters
export const apiWithDefers = new Byte()
    .use((ctx) => console.time(ctx.path))
    .defer((ctx) => {
        // You should change the response here
        console.log(ctx.res.ok);
        console.timeEnd(ctx.path);
    })
    .get('/', send.body('Hi'));
