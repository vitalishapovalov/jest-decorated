import type { Class, ITestRunnerConstructor } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function RunWith(testRunner: ITestRunnerConstructor) {
    return function RunWithDecoratorFn(clazz: Class) {
        const describeRunner = DescribeRunner.getDescribeRunner(clazz, false);
        describeRunner.setTestRunner(new testRunner(describeRunner.getTestRunner()));
    };
}
