export type ComponentProvider = {
    name: PropertyKey;
    source: string;
    defaultProps?: Record<string, any>
        | (() => Record<string, any>);
    isAct?: boolean;
    isAsyncAct?: boolean;
};
