const objectSerializers: Record<string, (input: any) => any> = {
    Object: JSON.stringify,
    Promise: async input => serialize(await input)
};

const yieldInput = (input: any) => input;
const inputToString = (input: any) => input.toString();
const noop = () => null;

const serializers = {
    string: yieldInput,

    boolean: inputToString,
    symbol: inputToString,
    bigint: inputToString,
    number: inputToString,

    function: noop,
    undefined: noop,

    object: t => t === null ? null : (objectSerializers[t.constructor.name] ?? yieldInput)(t)
} satisfies Record<string, (input: any) => any>;

export default function serialize(input: any) {
    return serializers[typeof input](input);
}

