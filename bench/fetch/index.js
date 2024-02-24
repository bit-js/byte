// Byte
import { Byte, send } from '../..';

function createByte() {
    const app = new Byte()
        .get('/user', () => send.body('User'))
        .get('/user/comments', () => send.body('User comments'))
        .get('/user/avatar', () => send.body('User avatar'))
        .get('/event/:id', (ctx) => send.body(`Event ${ctx.params.id}`))
        .get('/event/:id/comments', (ctx) => send.body(`Event ${ctx.params.id} comments`))
        .get('/status', () => send.body('Status'))
        .get('/deeply/nested/route/for/testing', () => send.body('Deeply nested route for testing'));

    return app.fetch;
}

// Hono
import { Hono } from 'hono';
import { RegExpRouter } from 'hono/router/reg-exp-router';

function createHono() {
    const app = new Hono({ router: new RegExpRouter() })
        .get('/user', (ctx) => ctx.body('User'))
        .get('/user/comments', (ctx) => ctx.body('User comments'))
        .get('/user/avatar', (ctx) => ctx.body('User avatar'))
        .get('/event/:id', (ctx) => ctx.body(`Event ${ctx.req.param('id')}`))
        .get('/event/:id/comments', (ctx) => ctx.body(`Event ${ctx.req.param('id')} comments`))
        .get('/status', (ctx) => ctx.body('Status'))
        .get('/deeply/nested/route/for/testing', (ctx) => ctx.body('Deeply nested route for testing'));

    return app.fetch;
}

// Sunder
import { Router, Sunder } from 'sunder';

function createSunder() {
    const router = new Router()
        .get('/user', (ctx) => {
            ctx.response.body = 'User';
        })
        .get('/user/comments', (ctx) => {
            ctx.response.body = 'User comments';
        })
        .get('/user/avatar', (ctx) => {
            ctx.response.body = 'User avatar';
        })
        .get('/event/:id', (ctx) => {
            ctx.response.body = `Event ${ctx.params.id}`;
        })
        .get('/event/:id/comments', (ctx) => {
            ctx.response.body = `Event ${ctx.params.id} comments`;
        })
        .get('/status', (ctx) => {
            ctx.response.body = 'Status';
        })
        .get('/deeply/nested/route/for/testing', (ctx) => {
            ctx.response.body = 'Deeply nested route for testing';
        });

    const app = new Sunder();
    app.use(router.middleware);

    return app.fetch.bind(app);
}

// Main testing
import test from './test';

console.log('Benchmarking...');
const { benchmarks } = await test({
    Byte: createByte(),
    Hono: createHono(),
    Sunder: createSunder()
});

const groupResult = {};

for (let i = 0, { length } = benchmarks; i < length; ++i) {
    const result = benchmarks[i], { group } = result;
    if (group === null) continue;

    groupResult[group] ??= [];
    groupResult[group].push(`- ${result.name}: ${Math.round(result.stats.avg)}ns\n`);
}

for (const group in groupResult)
    console.log(`${group}:\n${groupResult[group].join('')}`);
