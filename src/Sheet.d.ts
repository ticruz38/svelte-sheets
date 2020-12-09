import { SvelteComponentTyped } from "svelte";
import type { Config } from "./defaultconfig";
export default class Sheet extends SvelteComponentTyped<
  SheetProps,
  SheetEvents,
  SheetSlots
> {}
declare const _SheetProps: {
  data?: (string | number | boolean)[][];
  columns?: any[];
  mergeCells?: Record<string, number[]>;
  style?: {
    [cellIndex: string]: string;
  };
  selection?: [number[], number[]];
  options: Config;
  start?: number;
  end?: number;
};
declare const _SheetEvents: {
  [evt: string]: CustomEvent<any>;
};
declare const _SheetSlots: {};
export declare type SheetProps = typeof _SheetProps;
export declare type SheetEvents = typeof _SheetEvents;
export declare type SheetSlots = typeof _SheetSlots;
export {};
