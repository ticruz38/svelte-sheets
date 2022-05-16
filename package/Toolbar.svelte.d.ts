import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        sheetNames: any;
        sheets?: any[];
        active?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ToolbarProps = typeof __propDef.props;
export declare type ToolbarEvents = typeof __propDef.events;
export declare type ToolbarSlots = typeof __propDef.slots;
export default class Toolbar extends SvelteComponentTyped<ToolbarProps, ToolbarEvents, ToolbarSlots> {
}
export {};
