export const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'trace'] as const;
export type RequestMethod = typeof methods[number];

