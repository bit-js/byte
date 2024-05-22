import type { ParamsKey } from '@bit-js/blitz';
import type { BaseRoute } from '../../server';

// Parameter types
type ParamValue = string | number | boolean;
type SetParams<V extends string> = ParamsKey<V> extends never ? {} : {
    /**
     * Rest parameter ('$') must start with a slash
     */
    params: { [K in ParamsKey<V>]: ParamValue }
};

// Main types
export interface QueryParams extends Record<string, string | string[] | number | number[] | boolean> { };

export interface RequestBaseProps extends Omit<RequestInit, 'body'> {
    query?: QueryParams;
};

export type RequestProps<T extends BaseRoute> = RequestBaseProps & SetParams<T['path']>;
