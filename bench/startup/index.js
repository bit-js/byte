import { exec } from './lib';

exec('Byte', [
    'import { Byte, send } from "../.."',
    'const app = new Byte()'
], (route) => `\t.get('${route.part}', () => send.body(${route.value}))`);

exec('Hono', [
    'import { Hono } from "hono"',
    'import { RegExpRouter as Router } from "hono/router/reg-exp-router"',
    'const app = new Hono({ router: new Router() })'
], (route) => `\t.get('${route.part}', (ctx) => ctx.body(${route.value}))`);

exec('Elysia', [
    'import { Elysia } from "elysia"',
    'const app = new Elysia()'
], (route) => `\t.get('${route.part}', () => ${route.value})`);
