import { Class, Spy } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function Spy(
    obj: Spy["obj"],
    prop: Spy["prop"],
    accessType?: Spy["accessType"]
) {
    return function SpyDecoratorFn(proto: object, name: string) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        return describeManager
            .getMocksManager()
            .registerSpy(name, obj, prop, accessType);
    };
}
