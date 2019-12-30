import { Mock, MockFn, Spy } from "@shared/types";

export interface IMocksService {

    registerMock(mock: Mock): void;

    registerMockFn(mockFn: MockFn): void;

    registerSpy(spy: Spy): void;

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
