import { exec } from './lib';

exec('Byte', [
    'import { Byte, send } from "../.."',
    'const { fetch } = new Byte()'
], (route) => `\t.get('${route.part}', () => send.body(${route.value}))`);

exec('Hono', [
    'import { Hono } from "hono"',
    'import { LinearRouter as Router } from "hono/router/linear-router"',
    'const { fetch } = new Hono({ router: new Router() })'
], (route) => `\t.get('${route.part}', (ctx) => ctx.body(${route.value}))`);

exec('Elysia', [
    'import { Elysia } from "elysia"',
    'const { fetch } = new Elysia()'
], (route) => `\t.get('${route.part}', () => ${route.value})`);
