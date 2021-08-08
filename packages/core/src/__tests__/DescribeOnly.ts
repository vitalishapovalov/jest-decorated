import { Describe, Test } from "../decorators";

const fnDefault1 = jest.fn();
const fnDefault2 = jest.fn();

@Describe()
class DescribeSpec1 {

    @Test()
    defaultTest() {
        fnDefault1();
    }
}

@Describe.only()
class DescribeOnlySpec {

    @Test()
    defaultTest() {
        expect(fnDefault1).not.toHaveBeenCalled();
        expect(fnDefault2).not.toHaveBeenCalled();
    }
}

@Describe()
class DescribeSpec2 {

    @Test()
    defaultTest() {
        fnDefault2();
    }
}
