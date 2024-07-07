import { $async, type BaseContext } from "../../core";
import { noop } from "../../utils/defaultOptions";

interface TypeMap {
  string: string;
  number: number;
  bool: boolean;
  file: File;
}

export interface FormPropertyOptions {
  type: keyof TypeMap;
  multipleItems?: boolean;
}
export type InferFormPropertyOptions<T extends FormPropertyOptions> =
  T['multipleItems'] extends true ? (TypeMap[T['type']])[] : TypeMap[T['type']];

export type FormSchema = Record<string, FormPropertyOptions>;

export type InferFormSchema<Schema extends FormSchema> = {
  [K in keyof Schema]: InferFormPropertyOptions<Schema[K]>
}

export const form = {
  get<Options extends FormPropertyOptions>(prop: string, { type, multipleItems }: Options): (ctx: BaseContext) => Promise<InferFormPropertyOptions<Options> | null> {
    return $async(Function('n', `const p=(f)=>${type === 'string'
      ? (multipleItems === true
        ? `{const v=f.getAll(${JSON.stringify(prop)});return v.every((x)=>typeof x==='string')?v:null;}`
        : `{const v=f.get(${JSON.stringify(prop)});return typeof v==='string'?v:null;}`)
      : type === 'number'
        ? (multipleItems === true
          ? `{const v=f.getAll(${JSON.stringify(prop)}).map((t)=>+t);return v.some(Number.isNaN)?v:null;}`
          : `{const v=+f.get(${JSON.stringify(prop)});return Number.isNaN(v)?null:v;}`)
        : type === 'file'
          ? (multipleItems === true
            ? `{const v=f.getAll(${JSON.stringify(prop)});return v.every((x)=>x instanceof File)?v:null;}`
            : `{const v=f.get(${JSON.stringify(prop)});return v instanceof File?v:null;}`)
          : `f.has(${JSON.stringify(prop)})`
      };return (c)=>c.req.formData().then(p).catch(n);`)(noop))
  },

  schema<Schema extends FormSchema>(schema: Schema): (ctx: BaseContext) => Promise<InferFormSchema<Schema> | null> {
    const parts: string[] = [''], sets = [];

    for (const key in schema) {
      const item = schema[key];
      const { type } = item;

      if (type === 'string') {
        parts.push(item.multipleItems === true
          ? `const ${key}=f.getAll(${JSON.stringify(key)});if(${key}.some((x)=>typeof x!=='string'))return null;`
          : `const ${key}=f.get(${JSON.stringify(key)});if(typeof ${key}!=='string')return null;`
        );
        sets.push(key);
      } else if (type === 'number') {
        parts.push(item.multipleItems === true
          ? `const ${key}=f.getAll(${JSON.stringify(key)}).map((t)=>+t);if(${key}.some(Number.isNaN))return null;`
          : `const ${key}=+f.get(${JSON.stringify(key)});if(Number.isNaN(${key}))return null;`
        );
        sets.push(key);
      } else if (type === 'file') {
        parts.push(item.multipleItems === true
          ? `const ${key}=f.getAll(${JSON.stringify(key)});if(${key}.some((x)=>!(x instanceof File)))return null;`
          : `const ${key}=+f.get(${JSON.stringify(key)});if(!(${key} instanceof File))return null;`
        );
      } else
        sets.push(`${key}:f.has(${JSON.stringify(key)})`);
    }

    return $async(Function('n', `const p=(f)=>{${parts.join('')}return {${sets}};};return (c)=>c.req.formData().then(p).catch(n);`)(noop));
  }
};
