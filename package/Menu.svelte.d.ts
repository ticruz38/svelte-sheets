import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        show?: boolean;
        x: any;
        y: any;
        data?: (string | number | boolean)[][];
        selected: string;
        copy: (e: any) => void;
        cut: (e: any) => void;
        paste: (e: any) => any[][];
        clear: (e: any) => any[][];
        delet: (e: any) => any[][];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type MenuProps = typeof __propDef.props;
export declare type MenuEvents = typeof __propDef.events;
export declare type MenuSlots = typeof __propDef.slots;
export default class Menu extends SvelteComponentTyped<MenuProps, MenuEvents, MenuSlots> {
}
export {};
