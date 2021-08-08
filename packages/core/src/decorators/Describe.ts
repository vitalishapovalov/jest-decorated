import type { Class, DescribeDecorator, ExtendedDescribe } from "@jest-decorated/shared";
import debug from "debug";
import { DescribeType } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:Describe");

/* tslint:disable-next-line:variable-name */
export const Describe: ExtendedDescribe = createDescribe(DescribeType.DEFAULT) as ExtendedDescribe;

Describe.only = createDescribe(DescribeType.ONLY);

Describe.skip = createDescribe(DescribeType.SKIP);

function createDescribe(describeType: DescribeType): DescribeDecorator {
    return function Describe(describeName?: string) {
        return function DescribeDecoratorFn(clazz: Class) {
            const parentDescribeRunner = DescribeRunner
                .getDescribeRunner((clazz as any).__proto__, false);
            const describeRunner = DescribeRunner.getDescribeRunner(clazz, false);

            log(`Registering Describe. Class name: ${clazz.name}; Describe name: ${describeName ?? clazz.name}; Describe type: ${describeType}`);

            if (!describeRunner?.getTestsService().getTests().length) {
                throw new SyntaxError("Your @Describe suite most contain at least one @Test or @It");
            }

            describeRunner.setDescribeName(describeName ?? clazz.name);
            describeRunner.setDescribeType(describeType);

            if (parentDescribeRunner) {
                describeRunner.updateDescribe(parentDescribeRunner);
            }

            describeRunner
                .registerDescribeInJest(parentDescribeRunner);
        };
    };
}
