import type { Class } from "@jest-decorated/shared";
import { Hook } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function AfterEach() {
    return function AfterEachDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        describeRunner
            .getHooksService()
            .registerHook(Hook.AFTER_EACH, methodName);
    };
}
