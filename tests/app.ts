// Server
import { Byte, send } from '@bit-js/byte';

const userApis = new Byte()
    .get('/:id', ctx => send.body(ctx.params.id));

export const app = new Byte()
    .get('/', () => send.body('Hi'))
    .route('/user', userApis)
    .post('/json', async ctx => send.json(await ctx.req.json()));


