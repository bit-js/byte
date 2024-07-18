// Request methods
export const methods = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'connect', 'trace'] as const;
export type RequestMethod = typeof methods[number];

export interface ProtoSchema extends Record<RequestMethod, any> { }
