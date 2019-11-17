import { Class, ITestRunnerConstructor } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function RunWith(testRunner: ITestRunnerConstructor) {
    return function RunWithDecoratorFn(clazz: Class) {
        const describeManager = DescribeManager.getDescribeManager(clazz, false);
        describeManager.setTestRunner(new testRunner(describeManager.getTestRunner()));
    };
}
