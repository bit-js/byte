type PathInjectFunction = (params: Record<string, any>) => string;
const injectPath: Record<string, PathInjectFunction> = {};

// Inject parameter to the path
// Small string builders can utilize rope string
function buildPathInject(path: string) {
  let parts = '';

  let paramIdx = path.indexOf(':');
  let start = 0;

  while (paramIdx !== -1) {
    if (paramIdx !== start) parts += path.substring(start, paramIdx);

    ++paramIdx;
    start = path.indexOf('/', paramIdx);

    if (start === -1) {
      parts += `\${p.${path.substring(paramIdx)}}`;
      return Function(`return (p)=>\`${parts}\``)();
    }

    parts += `\${p.${path.substring(paramIdx, start)}}`;
    paramIdx = path.indexOf(':', start + 1);
  }

  // Wildcard check
  parts += path.charCodeAt(path.length - 1) === 42
    ? `${path.substring(start, path.length - 2)}\${p.$}`
    : path.substring(start);

  return Function(`return (p)=>\`${parts}\``)();
}

export default function getInjectFn(path: string) {
  return injectPath[path] ??= buildPathInject(path);
}
