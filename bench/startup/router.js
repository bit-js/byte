import { exec } from './lib';

exec('blitz-new', [
    'import Blitz from "blitz-new"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`);

exec('blitz-old', [
    'import Blitz from "blitz-old"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`);
