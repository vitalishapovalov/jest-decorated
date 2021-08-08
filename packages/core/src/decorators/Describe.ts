import type { Class } from "@jest-decorated/shared";
import { isUndefined } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

export function Describe(describeName?: string) {
    return function DescribeDecoratorFn(clazz: Class) {
        const parentDescribeRunner = DescribeRunner
            .getDescribeRunner((clazz as any).__proto__, false);
        const describeRunner = DescribeRunner.getDescribeRunner(clazz, false);

        if (!describeRunner?.getTestsService().getTests().length) {
            throw new SyntaxError("Your @Describe suite most contain at least one @Test or @It");
        }

        describeRunner
            .setDescribeName(isUndefined(describeName) ? clazz.name : describeName);

        if (parentDescribeRunner) {
            describeRunner.updateDescribe(parentDescribeRunner);
        }

        describeRunner
            .registerDescribeInJest(parentDescribeRunner);
    };
}
