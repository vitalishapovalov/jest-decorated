import { Mock, MockFn, Spy } from "@shared/types";

export interface IMocksService {

    mergeInAll(mocksService: IMocksService): void;

    getMocks(): {
        mocks: Map<string, Mock>;
        mockFns: Map<string, MockFn>;
        spies:  Map<string, Spy>;
    };

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

    registerMockFnsAndSpiesInClass(): void;

    registerMocksInClass(): void;
}
