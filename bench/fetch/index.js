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

    app.fetch(new Request('http://localhost:3000'));
    return app.fetch;
}

// Elysia
import { Elysia } from 'elysia';

function createElysia() {
    const app = new Elysia()
        .get('/user', () => 'User')
        .get('/user/comments', () => 'User comments')
        .get('/user/avatar', () => 'User avatar')
        .get('/event/:id', (ctx) => `Event ${ctx.params.id}`)
        .get('/event/:id/comments', (ctx) => `Event ${ctx.params.id} comments`)
        .get('/status', () => 'Status')
        .get('/deeply/nested/route/for/testing', () => 'Deeply nested route for testing');

    app.fetch(new Request('http://localhost:3000'));
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

    app.fetch(new Request('http://localhost:3000'));
    return app.fetch;
}

// Main testing
import test from './test';

console.log('Benchmarking...');
const { benchmarks } = await test({
    Hono: createHono(),
    Byte: createByte(),
    Elysia: createElysia(),
});

const groupResult = {};

for (let i = 0, { length } = benchmarks; i < length; ++i) {
    const result = benchmarks[i], { group } = result;
    if (group === null) continue;

    groupResult[group] ??= [];
    groupResult[group].push(`- ${result.name}: ${Math.round(result.stats.avg)}ns\n`);
}

for (const group in groupResult)
    console.log(`"${group}":\n${groupResult[group].join('')}`);
