import type { Class, DescribeDecorator, ExtendedDescribe } from "@jest-decorated/shared";
import { DescribeType } from "@jest-decorated/shared";
import { isUndefined } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

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

            if (!describeRunner?.getTestsService().getTests().length) {
                throw new SyntaxError("Your @Describe suite most contain at least one @Test or @It");
            }

            describeRunner
                .setDescribeName(isUndefined(describeName) ? clazz.name : describeName);
            describeRunner
                .setDescribeType(describeType);

            if (parentDescribeRunner) {
                describeRunner.updateDescribe(parentDescribeRunner);
            }

            describeRunner
                .registerDescribeInJest(parentDescribeRunner);
        };
    };
}
