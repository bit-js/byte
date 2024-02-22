// Variable name check
const validStartChars = new Array<null | undefined>(123),
    validChars = new Array<null | undefined>(123);
// A - Z
for (let i = 65; i < 91; ++i)
    validChars[i] = validStartChars[i] = null;
// a - z
for (let i = 97; i < 123; ++i)
    validChars[i] = validStartChars[i] = null;
// $, _
validStartChars[95] = validChars[36] = validChars[95] = null;
// 0 - 9
for (let i = 48; i < 58; ++i)
    validChars[i] = null;

export default function isVariableName(value: string): boolean {
    if (validStartChars[value.charCodeAt(0)] !== null) return false;

    for (let i = 1, { length } = value; i < length; ++i)
        if (validChars[value.charCodeAt(i)] !== null)
            return false;

    return true;
}

