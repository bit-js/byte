// Server
import { Byte, send } from '@bit-js/byte';

const userApis = new Byte()
    .get('/:id', ctx => send.body(ctx.params.id));

const app = new Byte()
    .get('/', () => send.body('Hi'))
    .route('/user', userApis)
    .post('/json', async ctx => send.json(await ctx.req.json()));

// Export the fetch function
export const { fetch } = app;

export type App = typeof app;
