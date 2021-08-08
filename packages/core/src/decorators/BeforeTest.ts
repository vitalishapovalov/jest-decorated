import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:BeforeTest");

export function BeforeTest<InstanceType = any>(impl: (clazzInstance?: InstanceType) => any) {
    return function BeforeTestDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering BeforeTest hook. Test method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);

        describeRunner
            .getHooksService()
            .registerBeforeTestHook(methodName, impl);
    };
}
