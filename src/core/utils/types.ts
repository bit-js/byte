type ReturnOf<T> = T extends (...args: any) => infer R ? R : any;

export type AwaitedReturn<T> = Awaited<ReturnOf<T>>;

export type UnionToIntersection<U> = (
    U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void ? I : never

