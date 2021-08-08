import type { Class } from "@jest-decorated/shared";
import debug from "debug";
import { isCallable, isUndefined } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:DataProvider");

export function DataProvider(dataProviderName?: PropertyKey) {
    return function DataProviderDecoratorFn(proto: object, propName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const classInstance = describeRunner.getClassInstance();
        const resolvedName = isUndefined(dataProviderName) ? propName : dataProviderName;
        const resolveData: () => unknown[] = () => isCallable(classInstance[propName])
            ? classInstance[propName].call(classInstance)
            : classInstance[propName];

        log(`Registering DataProvider. Property name: ${String(propName)}; Resolved name: ${String(resolvedName)}; Class name: ${proto.constructor.name}`);

        describeRunner
            .getTestsService()
            .registerDataProvider(resolvedName, resolveData);
    };
}
