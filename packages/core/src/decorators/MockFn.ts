import type { Class, MockFn } from "@jest-decorated/shared";
import debug from "debug";
import { isCallable } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:MockFn");

export function MockFn(impl?: MockFn["impl"]) {
    return function MockFnDecoratorFn(proto: object, propName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering MockFn. Property name: ${propName}; Class name: ${proto.constructor.name}; Has impl: ${!!impl}`);

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@MockFn only accepts function as an argument.");
        }

        describeRunner
            .getMocksService()
            .registerMockFn({ impl, name: propName });
    };
}
