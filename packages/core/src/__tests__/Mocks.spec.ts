import {
    Describe,
    Mock,
    BeforeEach,
    MockFn,
    LazyImport,
    Test,
    Spy,
    BeforeAll,
    AutoCleared,
} from "../decorators";

@Describe()
class MockFnSpec {

    @MockFn()
    mockFn;

    @Test()
    async first() {
        expect(this.mockFn.getMockName()).toBe("mockFn");
        this.mockFn();
        expect(this.mockFn).toHaveBeenCalledTimes(1);
    }

    @Test()
    second() {
        expect(this.mockFn.getMockName()).toBe("mockFn");
        this.mockFn();
        this.mockFn();
        expect(this.mockFn).toHaveBeenCalledTimes(2);
    }

    @Test()
    third() {
        expect(this.mockFn.getMockName()).toBe("mockFn");
        this.mockFn();
        expect(this.mockFn).toHaveBeenCalledTimes(1);
    }
}

@Describe()
class SpySpec {

    @Spy(global, "isFinite")
    fetchSpy() {
        return false;
    }

    @Spy(console, "log")
    logSpy;

    @BeforeEach()
    @BeforeAll()
    async mixedHook() {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("mixedHook");
    }

    @BeforeEach()
    hookTwo() {
        console.log("hookTwo");
        global.isFinite(1);
    }

    @Test()
    first() {
        expect(this.fetchSpy).toHaveBeenCalledTimes(1);
        expect(this.fetchSpy).toHaveBeenCalledWith(1);
        expect(this.logSpy).toHaveBeenCalledTimes(3);
    }

    @Test()
    second() {
        expect(this.fetchSpy).toHaveBeenCalledTimes(1);
        expect(this.fetchSpy).toHaveBeenCalledWith(1);
        expect(this.logSpy).toHaveBeenCalledTimes(2);
    }
}

@Describe()
class MockAndLazyImportSpec {

    @Mock("./fixtures/moduleOne", () => ({
        default: "MOCKED_DEFAULT",
    }))
    moduleOne;

    @Mock("./fixtures/moduleTwo", {
        default: "MOCKED_DEFAULT_FACTORY",
    })
    moduleTwo;

    @LazyImport("./fixtures/combinedOne")
    combinedOne;

    @Test()
    first() {
        expect(this.combinedOne.foo).toMatchObject({
            default: "MOCKED_DEFAULT",
        });
        expect(this.combinedOne.bar).toMatchObject({
            default: "MOCKED_DEFAULT_FACTORY",
        });
    }
}

@Describe()
class MockAndLazyImportSpec2 {

    @Mock("./fixtures/moduleThree")
    moduleThree = () => ({
        default: "MOCKED_DEFAULT",
    })

    @Mock("./fixtures/moduleFour")
    moduleFour = {
        default: "MOCKED_DEFAULT_FACTORY",
    };

    @LazyImport("./fixtures/combinedTwo")
    combinedTwo;

    @Test()
    first() {
        expect(this.combinedTwo.foo).toMatchObject({
            default: "MOCKED_DEFAULT",
        });
        expect(this.combinedTwo.bar).toMatchObject({
            default: "MOCKED_DEFAULT_FACTORY",
        });
    }
}

@Describe()
class AutoClearedMockAndLazyImportSpec {

    @AutoCleared()
    @Mock("./fixtures/moduleFive")
    moduleFive() {
        return {
            default: jest.fn(),
        };
    }

    @AutoCleared()
    @Mock("./fixtures/moduleSix")
    moduleSix = {
        default: jest.fn(),
    };

    @LazyImport("./fixtures/combinedThree")
    combinedThree;

    @Test()
    first() {
        console.log(this.combinedThree);
        expect(this.moduleSix.default).not.toHaveBeenCalled();
        this.combinedThree.foo.default();
        this.combinedThree.bar.default();
        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }

    @Test()
    second() {
        expect(this.moduleSix.default).not.toHaveBeenCalled();
        this.combinedThree.foo.default();
        this.combinedThree.bar.default();
        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }

    @Test()
    third() {
        expect(this.moduleSix.default).not.toHaveBeenCalled();
        this.combinedThree.foo.default();
        this.combinedThree.bar.default();
        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }
}

@Describe()
class AutoClearedSpec {

    @AutoCleared()
    ac1 = {
        foo: jest.fn(),
        bar: {
            deepFoo: jest.fn(),
        },
    };

    @AutoCleared()
    ac2 = {
        foo: jest.fn(),
        bar: {
            deepFoo: jest.fn(),
        },
    };

    @AutoCleared()
    ac3 = jest.fn();

    @Test()
    first() {
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
        this.ac1.foo();
    }

    @Test()
    second() {
        expect(this.ac1.foo).not.toHaveBeenCalled();
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
        this.ac3();
    }

    @Test()
    third() {
        expect(this.ac3).not.toHaveBeenCalled();
        expect(this.ac1.foo).not.toHaveBeenCalled();
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
    }
}
