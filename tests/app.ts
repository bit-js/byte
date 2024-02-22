// Server
import { Byte, send } from '@bit-js/byte';

export const basicApis = new Byte()
    .get('/', () => send.body('Hi'))
    .get('/:id', ctx => send.body(ctx.params.id));

export const jsonApis = new Byte()
    .post('/json', async ctx => send.json(await ctx.req.json()), {
        body: async ctx => await ctx.req.json() as { message: string }
    });

// Export additional infos
export const appPath = import.meta.path;
