import { isCallable, isUndefined } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function DataProvider(dataProviderName?: PropertyKey) {
    return function DataProviderDecoratorFn(proto: object, propName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);
        const classInstance = describeManager.getClassInstance();
        const resolvedName = isUndefined(dataProviderName) ? propName : dataProviderName;
        const resolveData: () => any[] = () => isCallable(classInstance[propName])
            ? classInstance[propName].call(classInstance)
            : classInstance[propName];

        describeManager
            .getTestsManager()
            .registerDataProvider(resolvedName, resolveData);
    };
}
