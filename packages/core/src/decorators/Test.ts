import { isUndefined, isNumber } from "@js-utilities/typecheck";
import { Class, TestEntity } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Test(testNameOrTimeout?: string | ((...args: unknown[]) => string) | number, timeout?: number) {
    return function TestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedTestDescription: string | ((...args: unknown[]) => string) =
            isUndefined(testNameOrTimeout) || isNumber(testNameOrTimeout)
                ? String(methodName)
                : testNameOrTimeout;
        const resolvedTimeout = isNumber(testNameOrTimeout)
            ? testNameOrTimeout
            : timeout;

        describeRunner
            .getTestsService()
            .registerTest(new TestEntity(methodName, resolvedTestDescription, resolvedTimeout));
    };
}

export function It(itName?: string | ((...args: unknown[]) => string)) {
    return Test(itName);
}
