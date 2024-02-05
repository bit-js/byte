import type Byte from '..';
import type { Handler } from './types';

export const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
export type RequestMethod = typeof methods[number];

export type Route = {
    path: string,
    method: string,
    handler: Handler
}

export type RoutesRecord = Route[];

export type HandlerRegister<T extends RoutesRecord> = {
    [Method in RequestMethod]: <
        Path extends string,
        H extends Handler<Path>
    >(path: Path, handler: H) => Byte<[...T, {
        path: Path,
        method: Method,
        handler: H,
    }]>;
}

