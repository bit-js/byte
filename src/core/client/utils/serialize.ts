type Serializer = (input: any) => any;

const objectSerializers: Record<string, Serializer> = {
  // Stringify object literal
  Object: JSON.stringify,
  // Try serialize promise
  Promise: (input) => input.then(serialize)
};

export default function serialize(input: any) {
  switch (typeof input) {
    case 'string': return input;
    case 'object': return input === null ? null : objectSerializers[input.constructor.name](input) ?? input;
    case 'number': return `${input}`;
    case 'bigint': return `${input}`;
    case 'boolean': return `${input}`;

    default: return null;
  }
}
