// Server
import { Byte, send, parse, cors, csrf, timing } from '@bit-js/byte';
import { randomUUID } from 'crypto';

// Basic responses
export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', (ctx) => send.body(ctx.params.id));

// Parse & send JSON
export const jsonApis = new Byte()
    .post('/json', {
        body: parse.json()
    }, (ctx) => send.json(ctx.state.body));

// CORS
export const apiWithCors = new Byte()
    .use(cors({ allowMethods: 'GET' }))
    .get('/', (ctx) => send.body('Hi', ctx));

// CSRF protection
export const apiWithCsrf = new Byte()
    .get('/', csrf(), () => send.body('Hi'));

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
        return send.body(value, ctx);
    });

