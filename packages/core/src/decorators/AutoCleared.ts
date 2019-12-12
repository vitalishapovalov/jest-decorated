import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function AutoCleared() {
    return function AutoClearedDecoratorFn(proto: object, name: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        describeRunner
            .getMocksService()
            .registerAutoCleared(name);
    };
}
