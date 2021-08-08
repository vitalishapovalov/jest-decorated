import { IDescribeRunner } from "@jest-decorated/shared";

import { Describe, RunWith, Test } from "../decorators";
import { TestRunner } from "../runners";

const fn = jest.fn();

class ExtendedTestRunner extends TestRunner {

    public override registerMocks(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerMocks(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerAutoCleared(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerAutoCleared(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerLazyModules(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerLazyModules(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerMockFnsAndSpies(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerMockFnsAndSpies(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerHooks(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerHooks(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
        fn();
    }
}

@Describe()
@RunWith(ExtendedTestRunner)
class RunWithSpec {

    @Test()
    first() {
        expect(fn).toHaveBeenCalledTimes(6);
    }
}

@Describe()
class RunWithSpecTest {

    @Test()
    first() {
        expect(fn).toHaveBeenCalledTimes(6);
    }
}
