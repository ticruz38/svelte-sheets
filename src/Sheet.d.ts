import { SvelteComponentTyped } from 'svelte';
import type { Config } from "./defaultconfig";
export default class Sheet extends SvelteComponentTyped<SheetProps, SheetEvents, SheetSlots> {
}
declare const _SheetProps: {
    data?: (string | number | boolean)[][];
    columns?: any[];
    rows?: any[];
    mergeCells?: Record<string, number[]>;
    style?: {
        [cellIndex: string]: string;
    };
    selected?: [string, string];
    extended?: [string, string];
    currentValue?: string | number | boolean;
    clipboard: any;
    options: Config;
    startY?: number;
    startX?: number;
    endY?: number;
    endX?: number;
};
declare const _SheetEvents: {
    [evt: string]: CustomEvent<any>;
};
declare const _SheetSlots: {};
export declare type SheetProps = typeof _SheetProps;
export declare type SheetEvents = typeof _SheetEvents;
export declare type SheetSlots = typeof _SheetSlots;
export {};
