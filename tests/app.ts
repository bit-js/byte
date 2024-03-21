// Server
import { Byte, send, parse, query, cors, csrf } from '@bit-js/byte';

export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', (ctx) => send.body(ctx.params.id))
    .get('/user', { query: query.get }, (ctx) => send.json(ctx.state.query));

export const jsonApis = new Byte()
    .post('/json', {
        body: parse.json()
    }, (ctx) => send.json(ctx.state.body, ctx));

export const apiWithCors = new Byte()
    .action(cors({ allowMethods: 'GET' }))
    .get('/', (ctx) => send.body('Hi', ctx));

export const apiWithCsrf = new Byte()
    .get('/', csrf(), () => send.body('Hi'));
