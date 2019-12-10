import { isCallable, isObject } from "@js-utilities/typecheck";
import { Class } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

export function Mock(mock: string, implOrOptions?: (() => any) | jest.MockOptions, options?: jest.MockOptions) {
    return function MockDecoratorFn(proto: object, methodName: string) {
        registerMock(mock, implOrOptions, options, proto, methodName, false);
    };
}

export function AutoClearedMock(mock: string, implOrOptions?: (() => any) | jest.MockOptions, options?: jest.MockOptions) {
    return function AutoClearedMockDecoratorFn(proto: object, methodName: string) {
        registerMock(mock, implOrOptions, options, proto, methodName, true);
    };
}

function registerMock(
    mock: string,
    implOrOptions: (() => any) | jest.MockOptions,
    options: jest.MockOptions,
    proto: object,
    methodName: string,
    autoClear: boolean
) {
    const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

    if (implOrOptions && (!isCallable(implOrOptions) && !isObject(implOrOptions))) {
        const decorator = autoClear ? "@AutoClearedMock" : "@Mock";
        throw new SyntaxError(`${decorator} only accepts function or object as second argument, instead passed ${implOrOptions}`);
    }

    const resolvedImpl = isCallable(implOrOptions)
        ? implOrOptions
        : isCallable(describeRunner.getClassInstance()[methodName])
            ? describeRunner.getClassInstance()[methodName].bind(describeRunner.getClassInstance())
            : undefined;
    describeRunner
        .getMocksService()
        .registerMock({
            autoClear,
            mock,
            mockName: methodName,
            impl: resolvedImpl,
            options: isCallable(implOrOptions) ? options : implOrOptions,
        });
}
