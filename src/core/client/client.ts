import type { BaseByte } from '../server';

import serialize from './utils/serialize';
import getInjectFn from './utils/pathInject';
import stringifyQuery from './utils/stringifyQuery';

import type { UnionToIntersection } from '../utils/types';

import type { InferRoutes } from './types/route';
import { emptyObj } from '../../utils/defaultOptions';

import type { ProtoSchema } from '../utils/methods';

/**
 * Infer client type
 */
export type InferClient<T extends BaseByte> = UnionToIntersection<
  InferRoutes<
    T['__infer']['routes'],
    T['__infer']['fallbackResponse']
  >
>;

/**
 * Customize client
 */
export interface ClientOptions {
  fetch?: (req: Request) => Promise<any>;
  init?: RequestInit;
}

const fetchFn = globalThis.fetch.bind(globalThis);

// Bit client prototype
export class BitClient implements ProtoSchema {
  /**
   * Base URL
   */
  readonly url: string;

  /**
   * Fetch function
   */
  readonly fetch: ClientOptions['fetch'] & {};

  /**
   * Default response init
   */
  readonly defaultInit: ClientOptions['init'] & {};

  constructor(url: string, options?: ClientOptions) {
    if (typeof options === 'undefined') {
      this.fetch = fetchFn;
      this.defaultInit = emptyObj;
    } else {
      this.fetch = options.fetch ?? fetchFn;
      this.defaultInit = options.init ?? emptyObj;
    }

    // Normalize URL
    const lastIdx = url.length - 1;
    this.url = url.charCodeAt(lastIdx) === 47 ? url.substring(0, lastIdx) : url;
  }

  async $(path: string, init?: any) {
    const { defaultInit } = this;
    if (typeof init === 'undefined')
      return this.fetch(new Request(this.url + path, defaultInit));

    for (const key in defaultInit)
    // @ts-expect-error Set new keys to init
      init[key] ??= defaultInit[key];

    const { params, body, query } = init;
    if (typeof body !== 'undefined')
      init.body = serialize(body);

    return this.fetch(new Request(
      // Cast URL parameters
      `${this.url}${typeof params === 'undefined' ? path : getInjectFn(path)(params)}${stringifyQuery(query)}`, init));
  }

  /** @internal */
  async get(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, getInit);

    init.method = 'GET';
    return this.$(path, init);
  }

  /** @internal */
  async head(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, headInit);

    init.method = 'HEAD';
    return this.$(path, init);
  }

  /** @internal */
  async post(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, postInit);

    init.method = 'POST';
    return this.$(path, init);
  }

  /** @internal */
  async put(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, putInit);

    init.method = 'PUT';
    return this.$(path, init);
  }

  /** @internal */
  async delete(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, deleteInit);

    init.method = 'DELETE';
    return this.$(path, init);
  }

  /** @internal */
  async options(path: string, init?: any) {
    if (typeof init === 'undefined')
      return this.$(path, optionsInit);

    init.method = 'OPTIONS';
    return this.$(path, init);
  }

  /** @internal */
  async any(path: string, init?: any) {
    return typeof init === 'undefined' ? this.$(path) : this.$(path, init);
  }
}

// Default request init objects
const getInit = { method: 'GET' };
const headInit = { method: 'HEAD' };
const postInit = { method: 'POST' };
const putInit = { method: 'PUT' };
const deleteInit = { method: 'DELETE' };
const optionsInit = { method: 'OPTIONS' };

export type Client<T extends BaseByte> = InferClient<T> & BitClient;

