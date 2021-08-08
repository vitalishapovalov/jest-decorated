import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:AutoCleared");

export function AutoCleared() {
    return function AutoClearedDecoratorFn(proto: object, propName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering AutoCleared property. Property name: ${String(propName)}; Class name: ${proto.constructor.name}`);

        describeRunner
            .getMocksService()
            .registerAutoCleared(propName);
    };
}
