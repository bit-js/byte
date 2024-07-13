function createHex(shift: number) {
    return [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255,

        0, 1 << shift, 2 << shift, 3 << shift, 4 << shift, 5 << shift, 6 << shift, 7 << shift, 8 << shift, 9 << shift,

        255, 255, 255, 255, 255, 255, 255,

        10 << shift, 11 << shift, 12 << shift, 13 << shift, 14 << shift, 15 << shift,

        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,

        10 << shift, 11 << shift, 12 << shift, 13 << shift, 14 << shift, 15 << shift
    ];
}

const h4 = createHex(4);
function highHex(code: number) {
    return code > 102 ? 255 : h4[code];
}

const h0 = createHex(0);
function lowHex(code: number) {
    return code > 102 ? 255 : h0[code];
}

const data = [
    // The first part of the table maps bytes to character to a transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
    10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,

    // The second part of the table maps a state to a new state when adding a
    // transition.
    256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256,
    268, 256, 256, 256, 256, 280, 292, 304, 316, 328, 340, 352,
    256, 268, 268, 268, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 256, 256, 280, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 280, 280, 280, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 280, 280, 256, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 304, 304, 304, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 256, 304, 304, 256, 256, 256, 256, 256, 256, 256, 256,
    256, 304, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256
];

// Maps the current transition to a mask that needs to apply to the byte.
const mask = [
    0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
]

export default function decodeURIComponent(url: string, start: number, end: number) {
    let percentPosition = url.indexOf('%', start);
    if (percentPosition === -1) return url.substring(start, end);

    let decoded = '';

    let last = 0;
    let codepoint = 0;
    let startOfOctets = percentPosition;
    let state = 268;

    while (percentPosition < end) {
        const byte = highHex(url.charCodeAt(percentPosition + 1)) | lowHex(url.charCodeAt(percentPosition + 2));
        const type = data[byte];

        codepoint = (codepoint << 6) | (byte & mask[type]);
        state = data[state + type];

        if (state === 256) return url.substring(start, end);
        if (state === 268) {
            decoded += url.substring(last, startOfOctets);
            decoded += codepoint > 0xFFFF
                ? String.fromCharCode(
                    (0xD7C0 + (codepoint >> 10)),
                    (0xDC00 + (codepoint & 0x3FF))
                )
                : String.fromCharCode(codepoint);

            last = percentPosition + 3;
            percentPosition = url.indexOf('%', last);

            if (percentPosition === -1)
                return decoded + url.substring(last);

            startOfOctets = percentPosition;
            codepoint = 0;
        } else {
            percentPosition += 3;
            if (percentPosition >= end || url.charCodeAt(percentPosition) !== 37) return url.substring(start, end);
        }
    }

    return decoded + url.substring(last);
}
