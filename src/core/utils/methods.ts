// Request methods
export const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
export type RequestMethod = typeof methods[number];

export function injectProto(constructor: any, callback: (methodUpperCase: string) => any) {
    const { prototype } = constructor;

    for (let i = 0, { length } = methods; i < length; ++i)
        prototype[methods[i]] = callback(methods[i].toUpperCase());
}
