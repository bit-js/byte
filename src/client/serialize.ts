export interface SerializersGroup extends Record<string, (o: any) => any> { };

export const objectSerializers: SerializersGroup = {
    Object: o => {
        // @ts-ignore
        ctx.headers['Content-Type'] ??= 'application/json';
        return JSON.stringify(o);
    }
};

export const serializers: SerializersGroup = {
    number: (o: number) => o.toString(),
    boolean: (o: boolean) => o.toString(),
    function: (o: Function) => o.toString(),
    string: o => o,
    undefined: () => null,
    object: o => {
        if (o === null) return null;

        const serializer = objectSerializers[o.constructor.name];
        return typeof serializer === 'undefined' ? o : serializer(o);
    }
} as const;

/**
 * Serialize an abitrary entity
 */
export default (o: any) => serializers[typeof o](o);
