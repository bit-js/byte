import { exec } from './lib';

exec('Byte', [
    'import { Byte, send } from "../.."',
    'performance.mark("Build start")',
    'const { fetch } = new Byte()'
], (route) => `\t.get('${route.path}', () => send.body(${route.value}))`);

exec('Hono', [
    'import { Hono } from "hono"',
    'import { LinearRouter as Router } from "hono/router/linear-router"',
    'performance.mark("Build start")',
    'const { fetch } = new Hono({ router: new Router() })'
], (route) => `\t.get('${route.path}', (ctx) => ctx.body(${route.value}))`);
