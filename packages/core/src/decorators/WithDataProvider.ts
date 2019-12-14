import { isArray } from "@js-utilities/typecheck";
import { Class, TestEntity } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function WithDataProvider(dataProviders: PropertyKey | PropertyKey[]) {
    return function WithDataProviderDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedDataProviders = isArray(dataProviders) ? dataProviders : [dataProviders];
        const testsService = describeRunner.getTestsService();

        if (!testsService.getTest(methodName)) {
            testsService.registerTest(
                TestEntity.createWithNameAndDataProviders(methodName, resolvedDataProviders)
            );
            return;
        } else {
            describeRunner
                .getTestsService()
                .getTest(methodName)
                .registerDataProviders(resolvedDataProviders);
        }
    };
}
