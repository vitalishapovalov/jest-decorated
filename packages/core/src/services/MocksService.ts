import { isCallable, isObject } from "@js-utilities/typecheck";
import { IMocksService, Class, Mock, MockFn, Spy, resolveModule } from "@jest-decorated/shared";

export class MocksService implements IMocksService {

    public constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object
    ) {}

    private readonly mocks: Map<string, Mock> = new Map();

    private readonly mockFns: Map<string, MockFn> = new Map();

    private readonly spies: Map<string, Spy> = new Map();

    private readonly autoCleared: string[] = [];

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
        accessType?: Spy["accessType"],
        impl?: Spy["impl"]
    ): void {
        this.spies.set(name, { name, obj, prop, accessType, impl });
    }

    public registerMock(mock: Mock): void {
        this.mocks.set(mock.mockName, mock);
    }

    public registerAutoCleared(methodName: string): void {
        this.autoCleared.push(methodName);
    }

    public getMocks(): {
        mocks: Map<string, Mock>;
        mockFns: Map<string, MockFn>;
        spies:  Map<string, Spy>;
    } {
        return {
            mocks: new Map(this.mocks),
            mockFns: new Map(this.mockFns),
            spies: new Map(this.spies),
        };
    }

    public mergeInAll(mocksService: IMocksService): void {
        const { mocks, mockFns, spies } = mocksService.getMocks();
        if (mocks) {
            for (const mock of mocks.values()) {
                const mockAsMock = mock as Mock;
                this.registerMock(mockAsMock);
            }
        }
        if (mockFns) {
            for (const mockFn of mockFns.values()) {
                const mockFnAsMockFn = mockFn as MockFn;
                this.registerMockFn(mockFnAsMockFn.name, mockFnAsMockFn.impl);
            }
        }
        if (spies) {
            for (const spy of spies.values()) {
                const spyAsSpy = spy as Spy;
                this.registerSpy(spyAsSpy.name, spyAsSpy.obj, spyAsSpy.prop, spyAsSpy.accessType);
            }
        }
    }

    public registerMockFnsAndSpiesInClass(): void {
        for (const mockFn of this.mockFns.values()) {
            this.registerMockFnInClass(mockFn);
        }
        for (const spy of this.spies.values()) {
            this.registerSpyInClass(spy);
        }
    }

    public registerMocksInClass(): void {
        for (const mock of this.mocks.keys()) {
            this.registerMockInClass(mock);
        }
    }

    public registerAutoClearedInClass(): void {
        for (const autoClearedName of this.autoCleared) {
            this.registerAutoClearedValueInClass(this.clazzInstance[autoClearedName], autoClearedName);
        }
    }

    private registerMockFnInClass(mockFnConfig: MockFn): void {
        const mockFn = jest
            .fn(this.resolveMockFnImpl(mockFnConfig))
            .mockName(mockFnConfig.name);
        this.registerAutoClearedValueInClass(mockFn, mockFnConfig.name);
    }

    private registerSpyInClass(spyConfig: Spy): void {
        const spy = Boolean(spyConfig.accessType)
            ? jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>, spyConfig.accessType as any)
            : jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>);
        const spyImpl = this.resolveMockFnImpl(spyConfig);
        if (spyImpl) {
            spy
                .mockImplementation(spyImpl as any)
                .mockName(spyConfig.name);
        }
        this.registerAutoClearedValueInClass(spy, spyConfig.name);
    }

    private registerMockInClass(mockName: string): void {
        const { mock, impl, options, autoClear } = this.mocks.get(mockName);
        let modulePath: string;
        let requiredMock: any;
        try {
            resolveModule(mock, (resolvedModulePath) => {
                modulePath = resolvedModulePath;
                jest.doMock(modulePath, impl, options);
                requiredMock = jest.requireMock(modulePath);
                this.registerAutoClearedValueInClass(requiredMock, mockName, autoClear);
                afterAll(() => jest.unmock(modulePath));
            });
        } catch (e) {
            throw new EvalError("Error during mock registration. Aborting test suite... " + e.message);
        }
    }

    private registerAutoClearedValueInClass(
        value: jest.MockInstance<unknown, unknown[]>,
        name: string,
        isAutoCleared = true
    ): void {
        if (isAutoCleared) {
            afterEach(() => {
                // for some reason, this is being called after each test,
                // in every describe. First describe in file runs as expected,
                // and each test in second describe will have their own mockClear
                // plus all of the previous describe's mockClear.
                // doesn't affects tests, but need to fix.
                this.tryToClearMock(value);
            });
        }
        Object.defineProperty(this.clazz.prototype, name, {
            value,
            configurable: true,
            writable: true,
        });
    }

    private resolveMockFnImpl(mockFnConfig: MockFn | Spy): MockFn["impl"] | Spy["impl"] | undefined {
        if (mockFnConfig.impl) {
            return mockFnConfig.impl;
        }
        if (isCallable(this.clazzInstance[mockFnConfig.name])) {
            return this.clazzInstance[mockFnConfig.name].bind(this.clazzInstance);
        }
        return undefined;
    }

    private tryToClearMock(mock: any, depth = 1, maxDepth = 15): void {
        if (depth >= maxDepth) {
            return;
        }

        const currDepth = depth + 1;

        if (jest.isMockFunction(mock)) {
            mock.mockClear();
            return;
        }
        if (isObject(mock)) {
            for (const key of Object.keys(mock)) {
                this.tryToClearMock(mock[key], currDepth);
            }
        }
    }
}
