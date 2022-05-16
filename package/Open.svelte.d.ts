import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        onload: (sheets: any[], sheetNames: any[]) => void;
        sheetNames: any;
        sheets?: any[];
        open: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type OpenProps = typeof __propDef.props;
export declare type OpenEvents = typeof __propDef.events;
export declare type OpenSlots = typeof __propDef.slots;
export default class Open extends SvelteComponentTyped<OpenProps, OpenEvents, OpenSlots> {
}
export {};
