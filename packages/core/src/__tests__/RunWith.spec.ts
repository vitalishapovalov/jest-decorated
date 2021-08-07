import { IDescribeRunner } from "@jest-decorated/shared";

import { Describe, RunWith, Test } from "../decorators";
import { TestRunner } from "../runners";

const fn = jest.fn();

class ExtendedTestRunner extends TestRunner {

    public override beforeTestsJestRegistration(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.beforeTestsJestRegistration(describeRunner, parentDescribeRunner);
        fn();
    }

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
        fn();
    }

    public override afterTestsJestRegistration(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        super.afterTestsJestRegistration(describeRunner, parentDescribeRunner);
        fn();
    }
}

@Describe()
@RunWith(ExtendedTestRunner)
class RunWithSpec {

    @Test()
    first() {
        expect(true).toBeTruthy();
    }
}

@Describe()
class RunWithSpecTest {

    @Test()
    first() {
        expect(fn).toHaveBeenCalledTimes(3);
    }
}
