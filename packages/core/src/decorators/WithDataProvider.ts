import { isArray } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function WithDataProvider(dataProviders: PropertyKey | PropertyKey[]) {
    return function WithDataProviderDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedDataProviders = isArray(dataProviders) ? dataProviders : [dataProviders];

        describeRunner
            .getTestsService()
            .getTest(methodName)
            .registerDataProviders(resolvedDataProviders);
    };
}
