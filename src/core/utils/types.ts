export type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
export type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;

export type MaybePromise<T> = T | Promise<T>;
export type Promisify<T> = T extends Promise<any> ? T : Promise<T>;

export type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

export type DropFirstInTuple<T extends any[]> = ((...args: T) => any) extends (arg: any, ...rest: infer U) => any ? U : T;
export type LastItem<T extends any[]> = T[DropFirstInTuple<T>['length']];
