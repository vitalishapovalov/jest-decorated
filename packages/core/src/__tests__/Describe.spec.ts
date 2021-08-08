import { Describe, Test } from "../decorators";

const fnSkip1 = jest.fn();
const fnSkip2 = jest.fn();

@Describe.skip("skipped describe test 1")
class DescribeSkip1Spec {

    @Test()
    defaultTest() {
        fnSkip1();
    }
}

@Describe()
class DescribeSpec {

    @Test()
    defaultTest() {
        expect(fnSkip1).not.toHaveBeenCalled();
        expect(fnSkip2).not.toHaveBeenCalled();
    }
}

@Describe.skip("skipped describe test 2")
class DescribeSkip2Spec {

    @Test()
    defaultTest() {
        fnSkip2();
    }
}
