export type Spy = {
    name: string;
    obj: object;
    prop: string;
    accessType?: "get" | "set";
    impl?: (...args: any[]) => any;
};
