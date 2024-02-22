import accessor from '../../utils/accessor';

export default function createSend(headers: Record<string, string>, f: any): any {
    const body = f === null ? 'b' : 'f(b)';
    const propAssigns = [];

    for (const key in headers)
        propAssigns.push(`headers${accessor(key)}??=${JSON.stringify(headers[key])}`);

    // h is default response headers
    // i is default response init
    // f is the body parser
    // b is the input body
    // t is the input response init
    return Function(
        'h', 'i', 'f',
        `return (b,t)=>{if(typeof t==='undefined')return new Response(${body},i);const{headers}=t;if(typeof headers==='undefined')t.headers=h;else{${propAssigns.join(';')}}return new Response(${body},t)}`
    )(headers, { headers }, f);
}
