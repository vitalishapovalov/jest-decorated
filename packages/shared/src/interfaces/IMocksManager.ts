import { MockFn, Spy } from "../types";

export interface IMocksManager {

    getMocks(): readonly (Map<string, MockFn | Spy>)[];

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
