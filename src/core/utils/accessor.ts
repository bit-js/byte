import isVariableName from './isVariableName';

export default function accessor(prop: string) {
    return isVariableName(prop) ? '.' + prop : `[${JSON.stringify(prop)}]`;
}
