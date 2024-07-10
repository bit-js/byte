import type { Byte } from '..';
import type { RoutesRecord } from '../route';

export interface Plugin<ResultState = {}> {
  plug(app: Byte<RoutesRecord>): Byte<RoutesRecord, ResultState> | void | null | undefined;
}

export type BasePlugin = Plugin<any>;

export type InferPluginState<Plugins extends BasePlugin[]> = Plugins extends [infer Item extends BasePlugin, ...infer Rest extends BasePlugin[]]
  ? (Item extends Plugin<infer State> ? State : {}) & InferPluginState<Rest>
  : {};
