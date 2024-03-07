export default function extendClass<T>(Construct: T, defaultProps: Record<string, any>): T {
    const parts = [];
    for (const key in defaultProps)
        parts.push(`${key}=${JSON.stringify(defaultProps[key])}`);

    return Function('C', `'use strict';return class extends C{${parts.join()}};`)(Construct);
}
