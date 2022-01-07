import type { IMocksService, Class, Mock, MockFn, Spy } from "@jest-decorated/shared";
import debug from "debug";
import { resolveModule } from "@jest-decorated/shared";
import { isCallable, isObject } from "@js-utilities/typecheck";

export class MocksService implements IMocksService {

    private static readonly log = debug("jest-decorated:core:MocksService");

    public constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object
    ) {
        MocksService.log("New instance crated");
    }

    private readonly mocks: Map<string, Mock> = new Map();

    private readonly mockFns: Map<string, MockFn> = new Map();

    private readonly spies: Map<string, Spy> = new Map();

    private readonly autoCleared: string[] = [];

    public registerMockFn(mockFn: MockFn): void {
        MocksService.log(`Registering mock function. MockFn: ${mockFn}`);
        this.mockFns.set(mockFn.name, mockFn);
    }

    public registerSpy(spy: Spy): void {
        MocksService.log(`Registering spy. Spy: ${spy}`);
        this.spies.set(spy.name, spy);
    }

    public registerMock(mock: Mock): void {
        MocksService.log(`Registering mock. Mock: ${mock}`);
        this.mocks.set(mock.mockName, mock);
    }

    public registerAutoCleared(methodName: string): void {
        MocksService.log(`Registering auto cleared. Method name: ${methodName}`);
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
        MocksService.log(`Merging in. Merged mocks service: ${String(mocksService)}`);
        const { mocks, mockFns, spies } = mocksService.getMocks();
        if (mocks) {
            for (const mock of mocks.values()) {
                this.registerMock(mock as Mock);
            }
        }
        if (mockFns) {
            for (const mockFn of mockFns.values()) {
                this.registerMockFn(mockFn as MockFn);
            }
        }
        if (spies) {
            for (const spy of spies.values()) {
                this.registerSpy(spy as Spy);
            }
        }
    }

    public registerMockFnsAndSpiesInClass(): void {
        MocksService.log("Registering mock function and spies in class...");
        for (const mockFn of this.mockFns.values()) {
            this.registerMockFnInClass(mockFn);
        }
        for (const spy of this.spies.values()) {
            this.registerSpyInClass(spy);
        }
        MocksService.log("Registering mock function and spies in class DONE");
    }

    public registerMocksInClass(): void {
        MocksService.log("Registering mocks in class...");
        for (const mock of this.mocks.keys()) {
            this.registerMockInClass(mock);
        }
        MocksService.log("Registering mocks in class DONE");
    }

    public registerAutoClearedInClass(): void {
        MocksService.log("Registering auto cleared in class...");
        for (const autoClearedName of this.autoCleared) {
            if (this.mocks.has(autoClearedName)) {
                // name will be registered as a Mock and auto cleared there
                continue;
            }
            this.registerAutoClearedValueInClass(this.clazzInstance[autoClearedName], autoClearedName);
        }
        MocksService.log("Registering auto cleared in class DONE");
    }

    private registerMockFnInClass(mockFnConfig: MockFn): void {
        MocksService.log(`Registering mock function in class. Mock function config: ${mockFnConfig}`);
        const mockFn = jest
            .fn(this.resolveMockFnImpl(mockFnConfig))
            .mockName(mockFnConfig.name);
        this.registerAutoClearedValueInClass(mockFn, mockFnConfig.name);
    }

    private registerSpyInClass(spyConfig: Spy): void {
        MocksService.log(`Registering mock function in class. Spy config: ${spyConfig}`);
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
        MocksService.log(`Registering mock function in class. Mock name: ${mockName}`);
        const { mock, impl, options } = this.mocks.get(mockName);
        let modulePath: string;
        let requiredMock: any;
        try {
            resolveModule(mock, (resolvedModulePath) => {
                modulePath = resolvedModulePath;
                jest.doMock(modulePath, impl, options);
                requiredMock = jest.requireMock(modulePath);
                this.registerAutoClearedValueInClass(
                    requiredMock,
                    mockName,
                    this.autoCleared.includes(mockName)
                );
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
        MocksService.log(`Registering auto cleared value in class. Name: ${name}`);
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

    private tryToClearMock(mock: any, depth = 0, maxDepth = 15): void {
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
