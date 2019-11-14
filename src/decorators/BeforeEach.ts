import { Class, Hook } from "../types";
import DescribeManager from "../modules/DescribeManager";

export function BeforeEach(canBeUsedInFuture?: string) {
    return function BeforeEachDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        describeManager
            .getHooksManager()
            .registerHook(Hook.BEFORE_EACH, methodName);
    };
}
