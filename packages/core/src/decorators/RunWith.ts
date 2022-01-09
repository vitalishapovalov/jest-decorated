import type { Class, ITestRunnerConstructor } from "@jest-decorated/shared";
import debug from "debug";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:RunWith");

export function RunWith(testRunner: ITestRunnerConstructor) {
    return function RunWithDecoratorFn(clazz: Class) {
        const describeRunner = DescribeRunner.getDescribeRunner(clazz, false);

        log(`Registering RunWith. Class name: ${clazz.name}; Test runner class name: ${testRunner.name}`);

        describeRunner.setCustomTestRunner(new testRunner(describeRunner.getTestRunner()));
    };
}
