import { Class, ITestRunnerConstructor } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function RunWith(TestRunner: ITestRunnerConstructor) {
    return function RunWithDecoratorFn(clazz: Class) {
        const describeManager = DescribeManager.getDescribeManager(clazz, false);
        describeManager.setTestRunner(new TestRunner(describeManager.getTestRunner()));
    }
}
