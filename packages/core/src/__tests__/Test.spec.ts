import { Describe, MockFn, Test } from "../decorators";

@Describe()
class TestOnlySpec {

    @MockFn()
    mockFn;

    @Test()
    test1() {
        this.mockFn();
    }

    @Test.only()
    testOnly() {
        expect(this.mockFn).not.toHaveBeenCalled();
    }

    @Test()
    test2() {
        this.mockFn();
    }
}

@Describe()
class TestSkipSpec {

    @MockFn()
    mockFn;

    @Test.skip()
    testSkip1() {
        this.mockFn();
    }

    @Test()
    test() {
        expect(this.mockFn).not.toHaveBeenCalled();
    }

    @Test.skip()
    testSkip2() {
        this.mockFn();
    }
}

@Describe()
class TestConcurrentSpec {

    @Test.concurrent()
    testConcurrent1() {
        expect(true).toBeTruthy();
    }

    @Test.concurrent()
    testConcurrent2() {
        expect(false).toBeFalsy();
    }
}
