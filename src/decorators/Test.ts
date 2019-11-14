import { isUndefined } from "@js-utilities/typecheck";

import { Class } from "../types";
import { toString } from "../utils";
import DescribeManager from "../modules/DescribeManager";
import TestEntity from "../modules/Test"; // tslint:disable-line

export function Test(testName?: string | ((...args: any[]) => string)) {
    return function TestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);
        const resolvedTestDescription: string | ((...args: any[]) => string) = isUndefined(testName)
            ? toString(methodName)
            : testName;
        describeManager
            .getTestsManager()
            .registerTest(new TestEntity(methodName, resolvedTestDescription));
    };
}

export function It(itName?: string) {
    return Test(itName);
}
