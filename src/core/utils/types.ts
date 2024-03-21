export type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
export type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;

export type MaybePromise<T> = T | Promise<T>;
export type Promisify<T> = T extends Promise<any> ? T : Promise<T>;

export type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;

export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

export type LastItem<T extends any[]> = T extends [...any[], infer Last] ? Last : any;
export type Items<T extends any> = [...T[], T];

export type NormalizeEnd<T extends string> = T extends '/' ? '/' : (T extends `${infer Start}/` ? Start : T);
export type NormalizePath<T extends string> = NormalizeEnd<T extends `${infer Start}//${infer End}` ? `${Start}/${End}` : T>;
