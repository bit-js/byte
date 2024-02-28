export type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;

