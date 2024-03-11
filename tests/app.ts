// Server
import { Byte, send, parse, query } from '@bit-js/byte';

export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', (ctx) => send.body(ctx.params.id))
    .get('/user', { query: query.get }, (ctx) => send.json(ctx.state.query));

export const jsonApis = new Byte()
    .post('/json', {
        body: parse.json()
    }, (ctx) => send.json(ctx.state.body, ctx));
