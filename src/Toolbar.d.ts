import { SvelteComponentTyped } from "svelte";
export default class Toolbar extends SvelteComponentTyped<
  ToolbarProps,
  ToolbarEvents,
  ToolbarSlots
> {}
declare const _ToolbarProps: {
  sheetNames: any;
  sheets?: any[];
  active?: number;
};
declare const _ToolbarEvents: {
  [evt: string]: CustomEvent<any>;
};
declare const _ToolbarSlots: {};
export declare type ToolbarProps = typeof _ToolbarProps;
export declare type ToolbarEvents = typeof _ToolbarEvents;
export declare type ToolbarSlots = typeof _ToolbarSlots;
export {};
