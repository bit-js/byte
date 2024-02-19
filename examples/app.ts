import { Byte } from '..';

export default new Byte()
    .get('/', () => 'Hi')
    .get('/user/:id', ctx => ctx.params.id)
    .post('/json', ctx => ctx.req.json())
