type PathInjectFunction = (params: Record<string, any>) => string;
const injectPath: Record<string, PathInjectFunction> = {};

// Inject parameter to the path
function buildPathInject(path: string) {
    const parts: string[] = [];

    let paramIdx = path.indexOf(':'), start = 0;
    while (paramIdx !== -1) {
        if (paramIdx !== start)
            parts.push(path.substring(start, paramIdx));

        ++paramIdx;
        start = path.indexOf('/', paramIdx);

        if (start === -1) {
            parts.push(`\${p.${path.substring(paramIdx)}}`);
            return Function(`return p=>\`${parts.join('')}\``)();
        }

        parts.push(`\${p.${path.substring(paramIdx, start)}}`);
        paramIdx = path.indexOf(':', start + 1);
    };

    // Wildcard check
    if (path.charCodeAt(path.length - 1) === 42)
        parts.push(`${path.substring(start, path.length - 2)}\${p.$}`);
    else
        parts.push(path.substring(start));

    return Function(`return p=>\`${parts.join('')}\``)();
}

export default function getInjectFn(path: string) {
    return injectPath[path] ??= buildPathInject(path);
}
