import { Byte } from '..';

const userApis = new Byte()
    .get('/:id', ctx => ctx.params.id);

export default new Byte()
    .get('/', () => 'Hi')
    .route('/user', userApis)
    .post('/json', ctx => ctx.req.json());
