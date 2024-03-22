import type { GenericResponse } from '../utils/responses';
import type { AwaitedReturn } from '../../utils/types';

import type { Params } from '@bit-js/blitz';
import type { Context } from './handler';

// Validator
export type ValidatorResult<T> = Exclude<AwaitedReturn<T>, GenericResponse>;
export type ValidatorProp<T, Prop extends string> = { [K in Prop]: ValidatorResult<T> };

export type ValidatorRecord<Path extends string = any> = Record<string, (c: Context<Params<Path>>) => any> | null;

export type InferValidatorRecord<T extends ValidatorRecord> = T extends null ? undefined : {
    [K in Extract<keyof T, string>]: ValidatorResult<T[K]>;
}
