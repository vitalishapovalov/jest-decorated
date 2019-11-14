import { isUndefined } from "@js-utilities/typecheck";

import { Class } from "../types";
import DescribeManager from "../modules/DescribeManager"

export function Describe(describeName?: string) {
    return function DescribeDecoratorFn(clazz: Class) {
        const describeManager = DescribeManager.getDescribeManager(clazz, false);

        if (!describeManager || !describeManager.getTestsManager().getTests().length) {
            throw new EvalError("Your @Describe suite most contain at least one @Test or @It");
        }

        const resolvedName = isUndefined(describeName) ? clazz.name : describeName;
        describeManager
            .registerDescribeInJest(resolvedName);
    };
}
