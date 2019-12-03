import { isCallable } from "@js-utilities/typecheck";
import { IMocksService, Class, Mock, MockFn, Spy, resolveModule } from "@jest-decorated/shared";

export class MocksService implements IMocksService {

    public constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object
    ) {}

    private mocks: Map<string, Mock> = new Map();

    private mockFns: Map<string, MockFn> = new Map();

    private spies: Map<string, Spy> = new Map();

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

    public registerMock(
        mockName: string,
        mock: string,
        impl?: () => any,
        options?: jest.MockOptions
    ): void {
        let modulePath: string;
        try {
            resolveModule(mock, (resolvedModulePath) => {
                modulePath = resolvedModulePath;
                jest.doMock(modulePath, impl, options);
                afterAll(() => jest.unmock(modulePath));
            });
        } catch (e) {
            console.error(e);
            throw new EvalError("Error during mock registration. Aborting test suite...");
        }

        const requiredMock = jest.requireMock(modulePath);

        this.mocks.set(mockName, { mockName, mock, impl, options });

        Object.defineProperty(this.clazz.prototype, mockName, {
            value: requiredMock,
        });
    }

    public mergeInAll(mocksService: IMocksService): void {
        const { mocks, mockFns, spies } = mocksService.getMocks();
        if (mocks) {
            for (const mock of mocks.values()) {
                const mockAsMock = mock as Mock;
                this.registerMock(
                    mockAsMock.mockName,
                    mockAsMock.mock,
                    mockAsMock.impl,
                    mockAsMock.options
                );
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

    private registerMockFnInClass(mockFnConfig: MockFn): void {
        const mockFn = jest.fn(this.resolveImpl(mockFnConfig));
        this.registerAutoClearedMockInClass(mockFn, mockFnConfig.name);
    }

    private registerSpyInClass(spyConfig: Spy): void {
        const spy = Boolean(spyConfig.accessType)
            ? jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>, spyConfig.accessType as any)
            : jest.spyOn(spyConfig.obj, spyConfig.prop as jest.NonFunctionPropertyNames<object>);
        const spyImpl = this.resolveImpl(spyConfig);
        if (spyImpl) {
            spy.mockImplementation(spyImpl as any);
        }
        this.registerAutoClearedMockInClass(spy, spyConfig.name);
    }

    private registerAutoClearedMockInClass(value: jest.MockInstance<any, any>, name): void {
        afterEach(() => value.mockClear());
        afterAll(() => value.mockRestore());
        Object.defineProperty(this.clazz.prototype, name, { value });
    }

    private resolveImpl(mockFnConfig: MockFn | Spy): MockFn["impl"] | Spy["impl"] | undefined {
        if (mockFnConfig.impl) {
            return mockFnConfig.impl;
        }
        if (isCallable(this.clazzInstance[mockFnConfig.name])) {
            return this.clazzInstance[mockFnConfig.name].bind(this.clazzInstance);
        }
        return undefined;
    }
}
