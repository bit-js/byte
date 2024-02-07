import Byte from '../src';

// Create a simple app
export default new Byte()
    // Simple routes
    .get('/', () => 'Hi')
    .get('/user/:id', ctx => ctx.params.id)
    // Handle JSON
    .post('/json', {
        body: async ctx => await ctx.req.json() as { a: string },
    }, ctx => ctx.state.body);
