import { isCallable } from "@js-utilities/typecheck";
import { IMocksManager, Class, MockFn, Spy } from "@jest-decorated/shared";

export default class MocksManager implements IMocksManager {

    public constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object
    ) {}

    private mockFns: Map<string, MockFn> = new Map();

    private spies: Map<string, Spy> = new Map();

    public registerMockFn(
        name: MockFn["name"],
        impl?: MockFn["impl"]
    ): void {
        this.mockFns.set(name, { name, impl });
    }

    public registerSpy(
        name: Spy["name"],
        obj: Spy["obj"],
        prop: Spy["prop"],
        accessType?: Spy["accessType"]
    ): void {
        this.spies.set(name, { name, obj, prop, accessType });
    }

    public registerMockFnsAndSpiesInClass(): void {
        for (const mockFn of this.mockFns.values()) {
            this.registerMockFnInClass(mockFn);
        }
        for (const spy of this.spies.values()) {
            this.registerSpyInClass(spy);
        }
    }

    private registerMockFnInClass(mockFnConfig: MockFn): void {
        const mockFn = jest.fn(this.resolveMockFnImpl(mockFnConfig));
        this.registerAutoClearedMockInClass(mockFn, mockFnConfig.name);
    }

    private registerSpyInClass(spyConfig: Spy): void {
        const spy = Boolean(spyConfig.accessType)
            ? jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>, spyConfig.accessType as any)
            : jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>);
        this.registerAutoClearedMockInClass(spy, spyConfig.name);
    }

    private registerAutoClearedMockInClass(value: jest.MockInstance<any, any>, name): void {
        afterEach(() => value.mockClear());
        Object.defineProperty(this.clazz.prototype, name, { value });
    }

    private resolveMockFnImpl(mockFnConfig: MockFn): MockFn["impl"] {
        if (mockFnConfig.impl) {
            return mockFnConfig.impl;
        }
        if (isCallable(this.clazzInstance[mockFnConfig.name])) {
            return this.clazzInstance[mockFnConfig.name].bind(this.clazzInstance);
        }
        return undefined;
    }
}
