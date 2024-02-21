import { app } from '../app';

// Get fetch function
const { fetch } = app;

// Register service worker
addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});
