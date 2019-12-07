import { isCallable, isUndefined } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function DataProvider(dataProviderName?: PropertyKey) {
    return function DataProviderDecoratorFn(proto: object, propName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const classInstance = describeRunner.getClassInstance();
        const resolvedName = isUndefined(dataProviderName) ? propName : dataProviderName;
        const resolveData: () => unknown[] = () => isCallable(classInstance[propName])
            ? classInstance[propName].call(classInstance)
            : classInstance[propName];

        describeRunner
            .getTestsService()
            .registerDataProvider(resolvedName, resolveData);
    };
}
