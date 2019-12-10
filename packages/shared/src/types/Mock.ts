export type Mock = {
    mockName: string;
    mock: string;
    impl?: () => any;
    autoClear?: boolean;
    options: jest.MockOptions;
};
