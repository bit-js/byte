// Server
import { Byte, parse, cors, csrf, timing, send } from '@bit-js/byte';
import { randomUUID } from 'crypto';

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

// Server timing
const createMetrics = timing({
    createUUID: 'Create a random UUID v4'
});

export const timingApi = new Byte()
    .get('/', (ctx) => {
        const metrics = createMetrics();

        metrics.start('createUUID');
        const value = randomUUID();
        metrics.end('createUUID');

        metrics.set(ctx);
        return ctx.body(value);
    });
