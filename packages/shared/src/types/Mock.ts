export type Mock = {
    mockName: string;
    mock: string;
    impl?: () => any;
    options: jest.MockOptions;
};
