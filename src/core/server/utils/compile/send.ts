export default function createSend(headers: Record<string, string>, bodyWrapper: any): any {
    // Response body wrapper
    const body = bodyWrapper === null
        ? 'b'
        : typeof bodyWrapper === 'string'
            ? `${bodyWrapper}(b)`
            : 'f(b)';

    const propAssigns = [];
    for (const key in headers)
        propAssigns.push(`headers[${JSON.stringify(key)}]??=${JSON.stringify(headers[key])}`);

    // h is default response headers
    // i is default response init
    // f is the body parser
    // b is the input body
    // t is the input response init
    return Function(
        'h', 'i', 'f',
        `return (b,t)=>{if(typeof t==='undefined')return new Response(${body},i);const{headers}=t;if(typeof headers==='undefined')t.headers=h;else{${propAssigns.join(';')}}return new Response(${body},t)}`
    )(headers, { headers }, bodyWrapper);
}
