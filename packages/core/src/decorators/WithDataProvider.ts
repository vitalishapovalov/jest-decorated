import type { Class } from "@jest-decorated/shared";
import debug from "debug";
import { TestEntity } from "@jest-decorated/shared";
import { isArray } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:WithDataProvider");

export function WithDataProvider(dataProviders: PropertyKey | PropertyKey[]) {
    return function WithDataProviderDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
        const resolvedDataProviders = isArray(dataProviders) ? dataProviders : [dataProviders];
        const testsService = describeRunner.getTestsService();

        log(`Registering WithDataProvider. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; DataProvider: ${String(dataProviders)}`);

        if (!testsService.getTest(methodName)) {
            testsService.registerTest(
                TestEntity.createWithNameAndDataProviders(methodName, resolvedDataProviders)
            );
            return;
        }

        describeRunner
            .getTestsService()
            .getTest(methodName)
            .registerDataProviders(resolvedDataProviders);
    };
}
