// Server
import { Byte, BasicResponse, JsonResponse } from '..';

const userApis = new Byte()
    .get('/:id', ctx => new BasicResponse(ctx.params.id));

export default new Byte()
    .get('/', () => new BasicResponse('Hi'))
    .route('/user', userApis)
    .post('/json', async ctx => new JsonResponse(ctx.req.json()));


