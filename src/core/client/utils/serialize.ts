type Serializer = (input: any) => any;

const objectSerializers: Record<string, Serializer> = {
    // Stringify object literal
    Object: JSON.stringify,
    // Try serialize promise
    Promise: async input => serialize(await input)
};

export default function serialize(input: any) {
    switch (typeof input) {
        case 'string': return input;

        case 'object': return input === null ? null : objectSerializers[input.constructor.name]?.(input) ?? input

        case 'undefined': return null;
        case 'function': return null;

        case 'number': return input.toString();
        case 'bigint': return input.toString();
        case 'symbol': return input.toString();
        case 'boolean': return input.toString();
    }
}
