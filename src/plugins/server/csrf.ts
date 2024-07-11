import type { Fn } from '../../core/server';
import { forbidden } from '../../utils/defaultOptions';

const defaultCSRF = ((ctx) => {
    if (ctx.req.headers.get('Origin') !== ctx.req.url.substring(0, ctx.pathStart))
        return new Response(null, forbidden);
}) satisfies Fn;

/**
 * CSRF action options
 */
export interface CSRFOptions<Fallback extends Fn = typeof defaultCSRF> {
    origins?: string[];
    verify?: (origin: string) => boolean;
    fallback?: Fallback;
}

export function csrf<Options extends CSRFOptions = CSRFOptions>(options?: Options): Options['fallback'] & {} {
    if (typeof options === 'undefined') return defaultCSRF;

    const literals = [];
    const keys = [];
    const values = [];

    if (typeof options.origins !== 'undefined') {
        const obj: Record<string, null> = {};

        const { origins } = options;
        for (let i = 0, { length } = origins; i < length; ++i)
            obj[origins[i]] = null;

        keys.push('o');
        values.push(obj);

        literals.push('_ in o');
    }

    if (typeof options.verify !== 'undefined') {
        keys.push('f');
        values.push(options.verify);

        literals.push('f(_)');
    }

    if (literals.length === 0)
        return defaultCSRF;

    let fallbackCall: string;
    if (typeof options.fallback === 'undefined') {
        keys.push('h');
        values.push(forbidden);

        fallbackCall = 'new Response(null,h)';
    } else {
        const { fallback } = options;

        keys.push('h');
        values.push(fallback);

        fallbackCall = `h${fallback.length === 0 ? '()' : '(c)'}`;
    }

    return Function(...keys, `return (c)=>{const _=c.req.headers.get('Origin');return ${literals.join('&&')}?null:${fallbackCall};}`)(...values);
}

