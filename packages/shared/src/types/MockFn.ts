export type MockFn = {
    name: string;
    impl: (...args: unknown[]) => any;
};
