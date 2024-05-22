import { exec } from './lib';

exec('blitz-edge', [
    'import { EdgeRouter } from "blitz-new"',
    'const app = new EdgeRouter()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`, 'app.build()');

exec('blitz-new', [
    'import Blitz from "blitz-new"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`, 'app.build()');

exec('blitz-old', [
    'import Blitz from "blitz-old"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`, 'app.build()');
