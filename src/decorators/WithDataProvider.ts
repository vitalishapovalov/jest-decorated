import { isArray } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function WithDataProvider(dataProviders: PropertyKey | PropertyKey[]) {
    return function WithDataProviderDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);
        const resolvedDataProviders = isArray(dataProviders) ? dataProviders : [dataProviders];

        describeManager
            .getTestsManager()
            .getTest(methodName)
            .registerDataProviders(resolvedDataProviders);
    };
}
