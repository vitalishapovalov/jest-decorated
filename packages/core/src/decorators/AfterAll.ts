import { Class, Hook } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function AfterAll(canBeUsedInFuture?: string) {
    return function AfterAllDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        describeManager
            .getHooksManager()
            .registerHook(Hook.AFTER_ALL, methodName);
    };
}
