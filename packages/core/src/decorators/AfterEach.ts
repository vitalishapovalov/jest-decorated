import { Class, Hook } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function AfterEach(canBeUsedInFuture?: string) {
    return function AfterEachDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        describeManager
            .getHooksManager()
            .registerHook(Hook.AFTER_EACH, methodName);
    };
}
