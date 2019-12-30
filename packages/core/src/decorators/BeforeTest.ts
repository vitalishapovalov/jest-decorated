import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function BeforeTest<InstanceType = any>(impl: (clazzInstance?: InstanceType) => any) {
    return function BeforeTestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        describeRunner
            .getHooksService()
            .registerBeforeTestHook(methodName, impl);
    };
}
