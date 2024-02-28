export type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;
export type MaybePromise<T> = T | Promise<T>;
