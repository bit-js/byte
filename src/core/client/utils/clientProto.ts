import type { ProtoSchema } from '../../utils/methods';

// Default request init objects
const getInit = { method: 'GET' };
const headInit = { method: 'HEAD' };
const postInit = { method: 'POST' };
const putInit = { method: 'PUT' };
const deleteInit = { method: 'DELETE' };
const optionsInit = { method: 'OPTIONS' };

/** @internal */
export default abstract class ClientProto implements ProtoSchema {
    abstract $(path: string, init?: any): any;

    get(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, getInit);

        init.method = 'GET';
        return this.$(path, init);
    }

    head(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, headInit);

        init.method = 'GET';
        return this.$(path, init);
    }

    post(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, postInit);

        init.method = 'POST';
        return this.$(path, init);
    }

    put(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, putInit);

        init.method = 'PUT';
        return this.$(path, init);
    }

    delete(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, deleteInit);

        init.method = 'DELETE';
        return this.$(path, init);
    }

    options(path: string, init?: any) {
        if (typeof init === 'undefined')
            return this.$(path, optionsInit);

        init.method = 'OPTIONS';
        return this.$(path, init);
    }

    any(path: string, init?: any) {
        return typeof init === 'undefined' ? this.$(path) : this.$(path, init);
    }
}
