import type { Class, MockFn } from "@jest-decorated/shared";
import { isCallable } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

export function MockFn(impl?: MockFn["impl"]) {
    return function MockFnDecoratorFn(proto: object, name: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@MockFn only accepts function as an argument.");
        }

        describeRunner
            .getMocksService()
            .registerMockFn({ name, impl });
    };
}
