import type { ProtoSchema } from '../../utils/methods';

/** @internal */
export default abstract class ServerProto implements ProtoSchema {
    abstract handle(...args: any[]): any;

    get(...args: any[]): any { return this.handle('GET', ...args); }
    head(...args: any[]): any { return this.handle('GET', ...args); }
    post(...args: any[]): any { return this.handle('POST', ...args); }
    put(...args: any[]): any { return this.handle('PUT', ...args); }
    delete(...args: any[]): any { return this.handle('DELETE', ...args); }
    options(...args: any[]): any { return this.handle('OPTIONS', ...args); }
    any(...args: any[]): any { return this.handle(null, ...args); }
}
