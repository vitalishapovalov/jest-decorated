import { isCallable } from "@js-utilities/typecheck";
import { Class, MockFn } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function MockFn(impl?: MockFn["impl"]) {
    return function MockFnDecoratorFn(proto: object, name: string) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@MockFn only accepts function as an argument.");
        }

        return describeManager
            .getMocksManager()
            .registerMockFn(name, impl);
    };
}
