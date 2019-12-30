import {
    Describe,
    Mock,
    BeforeEach,
    MockFn,
    Test,
    Spy,
    BeforeAll,
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
class MockSpec {

    @Mock("./fixtures/moduleOne", () => ({
        default: "MOCKED_DEFAULT",
    }))
    moduleOne;

    @Mock("./fixtures/moduleTwo", {
        default: "MOCKED_DEFAULT_FACTORY",
    })
    moduleTwo;

    @Test()
    first() {
        const combinedOne = require("./fixtures/combinedOne");
        expect(combinedOne.default.foo).toMatchObject({
            default: "MOCKED_DEFAULT",
        });
        expect(combinedOne.default.bar).toMatchObject({
            default: "MOCKED_DEFAULT_FACTORY",
        });
    }
}
