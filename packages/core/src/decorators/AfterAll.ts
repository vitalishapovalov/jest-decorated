import type { Class } from "@jest-decorated/shared";
import debug from "debug";
import { Hook } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:AfterAll");

export function AfterAll() {
    return function AfterAllDecoratorFn(proto: object, methodName: PropertyKey) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering AfterAll hook. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);

        describeRunner
            .getHooksService()
            .registerHook(Hook.AFTER_ALL, methodName);
    };
}
