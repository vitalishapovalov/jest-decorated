import type { Class } from "@jest-decorated/shared";
import debug from "debug";
import { Hook } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:BeforeAll");

export function BeforeAll() {
    return function BeforeAllDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering BeforeAll hook. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);

        describeRunner
            .getHooksService()
            .registerHook(Hook.BEFORE_ALL, methodName);
    };
}
