import type { Class, Spy } from "@jest-decorated/shared";
import { isCallable, isString } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

export function Spy(
    obj: Spy["obj"],
    prop: Spy["prop"],
    accessTypeOrImpl?: Spy["accessType"] | Spy["impl"],
    impl?: Spy["impl"]
) {
    return function SpyDecoratorFn(proto: object, name: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        if (accessTypeOrImpl && !isCallable(accessTypeOrImpl) && !isString(accessTypeOrImpl)) {
            throw new SyntaxError(
                "@Spy only accepts function (spy implementation) " +
                "or string (spy access type, 'get' or 'set') as " +
                "3rd argument."
            );
        }

        if (impl && !isCallable(impl)) {
            throw new SyntaxError("@Spy only accepts function as 4th argument.");
        }

        describeRunner
            .getMocksService()
            .registerSpy({
                name,
                obj,
                prop,
                accessType: isCallable(accessTypeOrImpl) ? undefined : isCallable(impl),
                impl: isCallable(accessTypeOrImpl) ? accessTypeOrImpl : impl,
            });
    };
}
