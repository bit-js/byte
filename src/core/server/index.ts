import type { BaseRouter } from '@bit-js/blitz';
import Blitz from '@bit-js/blitz';

import type { ProtoSchema, RequestMethod } from '../utils/methods';

import { Route, type RoutesRecord, type ActionList } from './route';
import { Context, type BaseHandler, type DeferFn, type Fn } from './types/handler';

import { bit } from '../client';
import { default404, emptyList } from '../../utils/defaultOptions';
import type { AwaitedReturn } from '../utils/types';
import type { ExcludeResponse, ExtractResponse } from './utils/responses';
import type { BasePlugin, InferPluginState } from './types/plugin';

// Methods to register request handlers
interface Register<Method extends string, T extends RoutesRecord, State, FallbackResponse> {
  <
    const Path extends string,
    const Handler extends BaseHandler<Path, State>
  >(
    path: Path,
    handler: Handler
  ): Byte<[...T, Route<Method, Path, Handler>], State>;

  <
    const Path extends string,
    const Handler extends BaseHandler<Path, State>
  >(
    path: Path,
    handlers: Handler
  ): Byte<[...T, Route<Method, Path, Handler>], State, FallbackResponse>;
}

type HandlerRegisters<T extends RoutesRecord, State, FallbackResponse> = {
  [Method in RequestMethod | 'any']: Register<Method, T, State, FallbackResponse>;
};

/**
 * Create a Byte app
 */
export class Byte<Rec extends RoutesRecord = [], State = {}, FallbackResponse = never> implements ProtoSchema {
  readonly actions: ActionList<State> = [];
  readonly defers: DeferFn<State>[] = [];

  /**
   * Register middlewares that doesn't require validations
   */
  prepare(fn: Fn<State>) {
    this.actions.push([1, fn]);
    return this;
  }

  /**
   * Register middlewares
   */
  use<Middleware extends Fn<State>>(fn: Middleware) {
    this.actions.push([2, fn]);
    return this as Byte<
      Rec, State, FallbackResponse | ExtractResponse<AwaitedReturn<Middleware>>
    >;
  }

  /**
   * Bind a prop to the context
   */
  set<Name extends string, Getter extends Fn<State>>(name: Name, fn: Getter) {
    this.actions.push([3, fn, name]);
    return this as Byte<
      Rec, State & { [K in Name]: AwaitedReturn<Getter> }, FallbackResponse
    >;
  }

  /**
   * Bind a prop to the context
   */
  state<Name extends string, Getter extends Fn<State>>(name: Name, fn: Getter) {
    this.actions.push([4, fn, name]);
    return this as Byte<
      Rec,
      State & { [K in Name]: ExcludeResponse<AwaitedReturn<Getter>> },
      FallbackResponse | ExtractResponse<AwaitedReturn<Getter>>
    >;
  }

  /**
   * Run after response handler
   */
  defer<Defer extends DeferFn<State>>(fn: Defer) {
    this.defers.push(fn);
    return this as Byte<
      Rec, State,
      FallbackResponse | ExtractResponse<AwaitedReturn<Defer>>
    >;
  }

  /**
   * Register plugins
   */
  register<Plugins extends BasePlugin[]>(...plugins: Plugins) {
    for (let i = 0, { length } = plugins; i < length; ++i)
      // @ts-expect-error
      plugins[i].plug(this);

    return this as Byte<Rec, State & InferPluginState<Plugins>, FallbackResponse>;
  }

  /**
   * Routes record. Only use this to infer types
   */
  readonly routes: RoutesRecord = [];

  /**
   * Register sub-routes
   */
  route<T extends BaseByte>(base: string, { routes }: T) {
    const currentRoutes = this.routes;
    const { actions, defers } = this;

    for (let i = 0, { length } = routes; i < length; ++i) currentRoutes.push(routes[i].clone(base, actions, defers));

    return this;
  }

  #fetch?: any;

  /**
   * Build the fetch function
   */
  build(router: BaseRouter = new Blitz()) {
    const { routes } = this;
    router.fallback = default404;

    for (let i = 0, { length } = routes; i < length; ++i) routes[i].register(router);

    return this.#fetch = router.build(Context);
  }

  /**
   * Get the fetch function for use
   */
  get fetch(): (req: Request) => any {
    return this.#fetch ??= this.build();
  }

  /**
   * Create a test client
   */
  client() {
    return bit<this>('http://127.0.0.1', this);
  }

  /**
   * Create a handler
   */
  static handle<const T extends Fn<{}>>(fn: T) {
    return fn;
  }

  /**
   * Create an defer handler
   */
  static defer<const T extends DeferFn<{}>>(fn: T) {
    return fn;
  }

  /**
   * Create a plugin
   */
  static plugin<const Plugin extends BasePlugin>(plugin: Plugin) {
    return plugin;
  }

  /**
   * Shorthand for registering subroutes
   */
  static route<T extends BaseByte>(base: string, app: T) {
    return new Byte().route(base, app);
  }

  /**
   * Register a handler
   */
  handle(method: string, path: string, ...args: any[]) {
    // Load necessary actions
    const { actions, defers } = this;

    // Push new route
    this.routes.push(new Route(
      method, path,
      // Check for validator
      args[0],
      // Load the actions and alters
      actions.length === 0 ? emptyList : [actions], defers.length === 0 ? emptyList : [defers]
    ));

    return this;
  }

  /** @internal */
  get(...args: any[]): any {
    // @ts-expect-error
    return this.handle('GET', ...args);
  }

  /** @internal */
  head(...args: any[]): any {
    // @ts-expect-error
    return this.handle('HEAD', ...args);
  }

  /** @internal */
  post(...args: any[]): any {
    // @ts-expect-error
    return this.handle('POST', ...args);
  }

  /** @internal */
  put(...args: any[]): any {
    // @ts-expect-error
    return this.handle('PUT', ...args);
  }

  /** @internal */
  delete(...args: any[]): any {
    // @ts-expect-error
    return this.handle('DELETE', ...args);
  }

  /** @internal */
  options(...args: any[]): any {
    // @ts-expect-error
    return this.handle('OPTIONS', ...args);
  }

  /** @internal */
  patch(...args: any[]): any {
    // @ts-expect-error
    return this.handle('PATCH', ...args);
  }

  /** @internal */
  connect(...args: any[]): any {
    // @ts-expect-error
    return this.handle('CONNECT', ...args);
  }

  /** @internal */
  trace(...args: any[]): any {
    // @ts-expect-error
    return this.handle('TRACE', ...args);
  }

  /** @internal */
  any(...args: any[]): any {
    // @ts-expect-error
    return this.handle(null, ...args);
  }
}

export interface Byte<Rec, State, FallbackResponse> extends HandlerRegisters<Rec, State, FallbackResponse> {
  __infer: {
    routes: Rec,
    state: State,
    fallbackResponse: FallbackResponse
  };
}

export type BaseByte = Byte<RoutesRecord, any, any>;

// Real stuff
export * from './route';

// Types
export * from './types/plugin';
export * from './types/handler';
export * from './types/responseInit';

// Internals and utils
export * from './utils/responses';
export * from './utils/macro';
