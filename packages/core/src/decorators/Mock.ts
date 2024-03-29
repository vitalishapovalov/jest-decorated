import type { Class, IDescribeRunner } from "@jest-decorated/shared";
import debug from "debug";
import { isCallable, isObject } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:Mock");

export function Mock(mock: string, impl?: (() => any) | object, options?: jest.MockOptions) {
    return function MockDecoratorFn(proto: object, methodName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering Mock. Method name: ${methodName}; Class name: ${proto.constructor.name}; Mock: ${mock}; Options: ${options}`);

        if (impl && (!isCallable(impl) && !isObject(impl))) {
            throw new SyntaxError(`@Mock only accepts function or object as second argument, instead passed ${impl}`);
        }

        const resolvedImpl = resolveMockImpl(describeRunner, methodName, impl);
        describeRunner
            .getMocksService()
            .registerMock({
                mock,
                options,
                mockName: methodName,
                impl: resolvedImpl,
            });
    };
}

function resolveMockImpl(
    describeRunner: IDescribeRunner,
    methodName: string,
    impl: (() => any) | object
): () => any {
    const methodValue = describeRunner.getClassInstance()[methodName];
    switch (true) {
        case isCallable(impl):
            return impl as () => any;
        case isCallable(methodValue):
            return methodValue.bind(describeRunner.getClassInstance());
        case isObject(methodValue):
            return () => methodValue;
        case isObject(impl):
            return () => impl;
        default:
            return undefined;
    }
}
