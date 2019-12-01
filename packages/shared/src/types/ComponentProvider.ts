export type ComponentProvider = {
    name: PropertyKey;
    source: string;
    defaultProps?: { [key: string]: any; } | (() => { [key: string]: any; }) | string;
    isAct?: boolean;
    isAsyncAct?: boolean;
};
