// Server
import { Byte, send, sendJson } from '..';

const userApis = new Byte()
    .get('/:id', ctx => send(ctx.params.id));

export default new Byte()
    .get('/', () => send('Hi'))
    .route('/user', userApis)
    .post('/json', async ctx => sendJson(await ctx.req.json()));


