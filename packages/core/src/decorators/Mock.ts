import { isCallable } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import DescribeManager from "../modules/DescribeManager";

export function Mock(mock: string, impl?: () => any, options?: jest.MockOptions) {
    return function MockDecoratorFn(proto: object, methodName: string) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@Mock only accepts function as second argument.");
        }

        const resolvedImpl = Boolean(impl)
            ? impl
            : isCallable(describeManager.getClassInstance()[methodName])
                ? describeManager.getClassInstance()[methodName].bind(describeManager.getClassInstance())
                : undefined;
        describeManager
            .getMocksManager()
            .registerMock(methodName, mock, resolvedImpl, options);
    };
}
