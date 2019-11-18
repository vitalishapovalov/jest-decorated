import { Mock, MockFn, Spy } from "../types";

export interface IMocksManager {

    getMocks(): {
        mocks: Map<string, Mock>;
        mockFns: Map<string, MockFn>;
        spies:  Map<string, Spy>;
    };

    registerMock(
        mockName: string,
        mock: string,
        impl?: () => any,
        options?: jest.MockOptions
    ): void;

    registerMockFn(
        name: MockFn["name"],
        impl?: MockFn["impl"]
    ): void;

    registerSpy(
        name: Spy["name"],
        obj: Spy["obj"],
        prop: Spy["prop"],
        accessType?: Spy["accessType"]
    ): void;

    registerMockFnsAndSpiesInClass(): void;

    update(mocksManager: IMocksManager): void;
}
