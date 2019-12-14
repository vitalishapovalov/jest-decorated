import { Mock, MockFn, Spy } from "@shared/types";

export interface IMocksService {

    registerMock(mock: Mock): void;

    registerMockFn(
        name: MockFn["name"],
        impl?: MockFn["impl"]
    ): void;

    registerSpy(
        name: Spy["name"],
        obj: Spy["obj"],
        prop: Spy["prop"],
        accessType?: Spy["accessType"],
        impl?: Spy["impl"]
    ): void;

    getMocks(): {
        mocks: Map<string, Mock>;
        mockFns: Map<string, MockFn>;
        spies:  Map<string, Spy>;
    };

    mergeInAll(mocksService: IMocksService): void;

    registerAutoCleared(methodName: string): void;

    registerMockFnsAndSpiesInClass(): void;

    registerMocksInClass(): void;

    registerAutoClearedInClass(): void;
}
