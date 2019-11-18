import { isCallable } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Mock(mock: string, impl?: () => any, options?: jest.MockOptions) {
    return function MockDecoratorFn(proto: object, methodName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@Mock only accepts function as second argument.");
        }

        const resolvedImpl = Boolean(impl)
            ? impl
            : isCallable(describeRunner.getClassInstance()[methodName])
                ? describeRunner.getClassInstance()[methodName].bind(describeRunner.getClassInstance())
                : undefined;
        describeRunner
            .getMocksService()
            .registerMock(methodName, mock, resolvedImpl, options);
    };
}
