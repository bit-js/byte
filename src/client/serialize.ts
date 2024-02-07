export interface SerializersGroup extends Record<string, (o: any) => any> { };

const yieldFn = (o: any) => o, toStr = (o: any) => o.toString();

export const objectSerializers: SerializersGroup = {
    Object: JSON.stringify,
    Buffer: yieldFn,
    Response: yieldFn,
    ArrayBuffer: yieldFn,
    URLSearchParams: yieldFn
};

export const serializers: SerializersGroup = {
    number: toStr,
    boolean: toStr,
    // Idk whatever
    function: toStr,
    string: yieldFn,
    undefined: () => null,
    object: o => o === null ? null : objectSerializers[o.constructor.name](o)
} as const;

/**
 * Serialize an abitrary entity
 */
export default (o: any): any => serializers[typeof o](o);
