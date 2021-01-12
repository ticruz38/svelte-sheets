import { SvelteComponentTyped } from 'svelte';
export default class Menu extends SvelteComponentTyped<MenuProps, MenuEvents, MenuSlots> {
}
declare const _MenuProps: {
    show?: boolean;
    data?: (string | number | boolean)[][];
    selected: string;
};
declare const _MenuEvents: {
    [evt: string]: CustomEvent<any>;
};
declare const _MenuSlots: {};
export declare type MenuProps = typeof _MenuProps;
export declare type MenuEvents = typeof _MenuEvents;
export declare type MenuSlots = typeof _MenuSlots;
export {};
