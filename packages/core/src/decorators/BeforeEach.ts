import type { Class } from "@jest-decorated/shared";
import { Hook } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function BeforeEach() {
    return function BeforeEachDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        describeRunner
            .getHooksService()
            .registerHook(Hook.BEFORE_EACH, methodName);
    };
}
