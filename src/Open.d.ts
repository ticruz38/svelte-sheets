import { SvelteComponentTyped } from 'svelte';
export default class Open extends SvelteComponentTyped<OpenProps, OpenEvents, OpenSlots> {
}
declare const _OpenProps: {
    onload: (sheets: any[], sheetNames: any[]) => void;
    sheetNames: any;
    sheets?: any[];
    open: any;
};
declare const _OpenEvents: {
    [evt: string]: CustomEvent<any>;
};
declare const _OpenSlots: {};
export declare type OpenProps = typeof _OpenProps;
export declare type OpenEvents = typeof _OpenEvents;
export declare type OpenSlots = typeof _OpenSlots;
export {};
