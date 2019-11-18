import { isUndefined } from "@js-utilities/typecheck";
import { Class, TestEntity, toString } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Test(testName?: string | ((...args: any[]) => string)) {
    return function TestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedTestDescription: string | ((...args: any[]) => string) = isUndefined(testName)
            ? toString(methodName)
            : testName;
        describeRunner
            .getTestsService()
            .registerTest(new TestEntity(methodName, resolvedTestDescription));
    };
}

export function It(itName?: string) {
    return Test(itName);
}
