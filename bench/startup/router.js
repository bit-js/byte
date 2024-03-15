import { exec } from './lib';

exec('blitz-1.0.12', [
    'import Blitz from "blitz-1.0.12"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`);

exec('blitz-1.0.13', [
    'import Blitz from "blitz-1.0.13"',
    'const app = new Blitz()'
], (route) => `app.put('GET', '${route.part}', () => new Response('${route.value}'))`);
