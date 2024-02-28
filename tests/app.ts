// Server
import { Byte, send, parse } from '@bit-js/byte';

export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', ctx => send.body(ctx.params.id));

export const jsonApis = new Byte()
    .post('/json', {
        body: parse.text()
    }, ctx => send.json(ctx.state.body));
