export default function serialize(input: any) {
  switch (typeof input) {
    case 'string': return input;
    case 'object':
      if (input === null) return null;

      const { constructor } = input;
      if (constructor === Object)
        return JSON.stringify(input);
      if (constructor === Promise)
        return input.then(serialize);
      if (constructor === Map)
        return JSON.stringify(Object.fromEntries(input));

      return input;

    case 'number': return `${input}`;
    case 'bigint': return `${input}`;
    case 'boolean': return `${input}`;

    default: return null;
  }
}
