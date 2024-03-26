// Server
import { Byte, send, parse, query, cors, csrf, timing } from '@bit-js/byte';
import { randomUUID } from 'crypto';

const parseQuery = query.schema({
    id: 'number',
    darkMode: 'bool',
    name: 'string',
});

// Basic responses
export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', (ctx) => send.body(ctx.params.id))
    .get('/user', (ctx) => send.json(parseQuery(ctx)));

// Parse & send JSON
export const jsonApis = new Byte()
    .post('/json', {
        body: parse.json()
    }, (ctx) => send.json(ctx.state.body));

// CORS
export const apiWithCors = new Byte()
    .action(cors({ allowMethods: 'GET' }))
    .get('/', (ctx) => send.body('Hi', ctx));

// CSRF protection
export const apiWithCsrf = new Byte()
    .get('/', csrf(), () => send.body('Hi'));

// Server timing
const Metrics = timing({
    createUUID: 'Create a random UUID v4'
});

export const timingApi = new Byte()
    .get('/', (ctx) => {
        const metrics = new Metrics();

        metrics.start('createUUID');
        const value = randomUUID();
        metrics.end('createUUID');

        ctx.headers['Server-Timing'] = metrics.get();
        return send.body(value, ctx);
    });
