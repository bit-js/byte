import type { BaseContext } from '../..';

export interface TimingInstance<Key extends string = never> {
    get(): string;
    set(ctx: BaseContext): void;

    start(metric: Key): void;
    end(metric: Key): void;
}

export interface TimingConstructor<Key extends string = never> {
    new(): TimingInstance<Key> & Record<Key, number>;
};

/**
 * Create a server timing metric record
 */
export function timing<Metrics extends Record<string, string | null>>(metrics: Metrics): () => TimingInstance<Extract<keyof Metrics, string>> & Record<keyof Metrics, number> {
    const keys = Object.keys(metrics);
    const keyCount = keys.length;

    const literalParts = new Array<string>(keyCount);

    const [firstKey] = keys;
    const firstDesc = metrics[firstKey];
    literalParts[0] = `\${typeof ${firstKey}==='undefined'?'':\`${firstKey}${firstDesc === null ? '' : `;desc=${JSON.stringify(firstDesc)}`};dur=\${${firstKey}}\`}`;

    for (let i = 1; i < keyCount; ++i) {
        const key = keys[i];
        const desc = metrics[key];

        literalParts[i] = `\${typeof ${key}==='undefined'?'':\`,${key}${desc === null ? '' : `;desc=${JSON.stringify(desc)}`};dur=\${${key}}\`}`;
    }

    return Function(`'use strict';class A{${keys.join(';')};start(m){this[m]=performance.now();};end(m){this[m]=performance.now()-this[m];};set(c){const {${keys.join()}}=this;c.headers['Server-Timing']=\`${literalParts.join('')}\`;};get(){const {${keys.join()}}=this;return \`${literalParts.join('')}\`;}};return ()=>new A();`)();
}
