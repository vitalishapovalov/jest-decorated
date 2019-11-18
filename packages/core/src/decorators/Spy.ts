import { Class, Spy } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Spy(
    obj: Spy["obj"],
    prop: Spy["prop"],
    accessType?: Spy["accessType"]
) {
    return function SpyDecoratorFn(proto: object, name: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        describeRunner
            .getMocksService()
            .registerSpy(name, obj, prop, accessType);
    };
}
