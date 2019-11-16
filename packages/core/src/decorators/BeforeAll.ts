import { Class, Hook } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function BeforeAll(canBeUsedInFuture?: string) {
    return function BeforeAllDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        describeManager
            .getHooksManager()
            .registerHook(Hook.BEFORE_ALL, methodName);
    };
}
