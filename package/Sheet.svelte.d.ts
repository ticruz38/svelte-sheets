import { SvelteComponentTyped } from "svelte";
import type { Config } from "./defaultconfig";
declare const __propDef: {
    props: {
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
        clipboard: [string, string];
        options: Config;
        startY?: number;
        startX?: number;
        endY?: number;
        endX?: number;
        onInputChange?: (value: any, row: any, column: any) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type SheetProps = typeof __propDef.props;
export declare type SheetEvents = typeof __propDef.events;
export declare type SheetSlots = typeof __propDef.slots;
export default class Sheet extends SvelteComponentTyped<SheetProps, SheetEvents, SheetSlots> {
    get onInputChange(): (value: any, row: any, column: any) => void;
}
export {};
