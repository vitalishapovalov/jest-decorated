import { isUndefined } from "@js-utilities/typecheck";
import { Class, TestEntity } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Test(testName?: string | ((...args: unknown[]) => string)) {
    return function TestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedTestDescription: string | ((...args: unknown[]) => string) = isUndefined(testName)
            ? String(methodName)
            : testName;
        describeRunner
            .getTestsService()
            .registerTest(new TestEntity(methodName, resolvedTestDescription));
    };
}

export function It(itName?: string) {
    return Test(itName);
}
