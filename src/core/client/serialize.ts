type Serializer = (input: any) => any;

const yieldInput: Serializer = input => input;
const inputToString: Serializer = input => input.toString();
const noop: Serializer = () => null;

const objectSerializers: Record<string, Serializer> = {
    // Stringify object literal
    Object: JSON.stringify,
    // Try serialize promise
    Promise: async input => serialize(await input),

    URLSearchParams: yieldInput,
    ArrayBuffer: yieldInput,
    FormData: yieldInput,
    Blob: yieldInput,
    ReadableStream: yieldInput,
    Response: yieldInput
};

const serializers = {
    string: yieldInput,

    boolean: inputToString,
    symbol: inputToString,
    bigint: inputToString,
    number: inputToString,

    function: noop,
    undefined: noop,

    object: t => t === null ? null : (objectSerializers[t.constructor.name] ?? yieldInput)(t)
} satisfies Record<string, Serializer>;

export default function serialize(input: any) {
    return serializers[typeof input](input);
}
