import { bit } from '..';
import type app from './app';

const client = bit<typeof app>('http://localhost:3000');

client.get('/user/:id', {
    params: { id: 90 }
});
