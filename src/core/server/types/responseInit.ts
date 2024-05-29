export interface StatusMap {
    100: 'Continue';
    101: 'Switching Protocols';
    103: 'Early Hints';

    200: 'OK';
    201: 'Created';
    202: 'Accepted';
    203: 'Non-Authoritative Information';
    204: 'No Content';
    205: 'Reset Content';
    206: 'Partial Content';
    207: 'Multi-Status';
    208: 'Already Reported';
    226: 'IM Used';

    300: 'Multiple Choices';
    301: 'Moved Permanently';
    302: 'Found';
    303: 'See Other';
    304: 'Not Modified';
    307: 'Temporary Redirect';
    308: 'Permanent Redirect';

    400: 'Bad Request';
    401: 'Unauthorized';
    402: 'Payment Required';
    403: 'Forbidden';
    404: 'Not Found';
    405: 'Method Not Allowed';
    406: 'Not Acceptable';
    407: 'Proxy Authentication Required';
    408: 'Request Timeout';
    409: 'Conflict';
    410: 'Gone';
    411: 'Length Required';
    412: 'Precondition Failed';
    413: 'Payload Too Large';
    414: 'URI Too Long';
    415: 'Unsupported Media Type';
    416: 'Range Not Satisfiable';
    417: 'Expectation Failed';
    418: 'I\'m a teapot';
    421: 'Misdirected Request';
    422: 'Unprocessable Content';
    423: 'Locked';
    424: 'Failed Dependency';
    425: 'Too Early';
    426: 'Upgrade Required';
    428: 'Precondition Required';
    429: 'Too Many Requests';
    431: 'Request Header Fields To Large';
    451: 'Unavailable For Legal Reasons';

    500: 'Internal Server Error';
    501: 'Not Implemented';
    502: 'Bad Gateway';
    503: 'Service Unavailable';
    504: 'Gateway Timeout';
    505: 'HTTP Version Not Supported';
    506: 'Variant Also Negotiates';
    507: 'Insufficient Storage';
    508: 'Loop Detected';
    510: 'Not Extended';
    511: 'Network Authentication Required';
}

export type CommonStatus = keyof StatusMap;

export type ImageMIMETypes = `image/${'bmp' | 'avif' | 'gif' | 'jpeg' | 'png' | 'svg+xml' | 'webp'}`;
export type TextMIMETypes = `text/${'css' | 'csv' | 'html' | 'plain' | 'javascript' | 'event-stream'}`;
export type AppMIMETypes = `application/${'octet-stream' | 'gzip' | 'json' | 'pdf' | 'xml' | 'zip' | 'ogg' | 'rtf'}`;
export type AudioMIMETypes = `audio/${'midi' | 'ogg' | 'webm' | 'mpeg' | 'wav'}`;
export type VideoMIMETypes = `video/${'mp4' | 'mpeg' | 'ogg' | 'webm'}`;
export type FontMIMETypes = `font/${'woff' | 'woff2' | 'ttf'}`;

export type MIMETypes = ImageMIMETypes | TextMIMETypes
    | AppMIMETypes | AudioMIMETypes | VideoMIMETypes
    | FontMIMETypes | (string & {});

export type CommonHeaders = ([
    'Set-Cookie' | 'Cache-Control' | 'Server'
    | 'Location' | 'ETag' | 'Referrer-Policy' | 'Vary' | 'Link'
    | 'Access-Control-Allow-Credentials' | 'Access-Control-Allow-Headers'
    | 'Access-Control-Allow-Methods' | 'Access-Control-Allow-Origin'
    | 'Access-Control-Expose-Headers' | 'Access-Control-Max-Age'
    | 'Access-Control-Request-Headers' | 'Access-Control-Request-Method'
    | 'Strict-Transport-Security' | 'Content-Security-Policy' | 'Connection'
    | 'Server-Timing' | 'Keep-Alive' | 'Last-Modified' | 'Expires' | (string & {}),
    string
] | ['Content-Type', MIMETypes])[];

/**
 * ResponseInit with commonly used props value
 */
export interface CommonResponseInit {
    status?: CommonStatus | (number & {});
    statusText?: StatusMap[CommonStatus] | (string & {});

    headers?: CommonHeaders;
}

