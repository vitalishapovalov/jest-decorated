export type ComponentProvider = {
    name: PropertyKey;
    source: string;
    defaultProps?: { [key: string]: any; }
        | (() => { [key: string]: any; });
    isAct?: boolean;
    isAsyncAct?: boolean;
};
