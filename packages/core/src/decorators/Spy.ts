import type { Class, Spy } from "@jest-decorated/shared";
import debug from "debug";
import { isCallable, isString } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:Spy");

export function Spy(
    obj: Spy["obj"],
    prop: Spy["prop"],
    accessTypeOrImpl?: Spy["accessType"] | Spy["impl"],
    impl?: Spy["impl"]
) {
    return function SpyDecoratorFn(proto: object, propName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering Spy. Property name: ${propName}; Class name: ${proto.constructor.name}; Spied obj: ${obj}; Spied prop: ${prop}`);

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
                name: propName,
                obj,
                prop,
                accessType: isCallable(accessTypeOrImpl) ? undefined : isCallable(impl),
                impl: isCallable(accessTypeOrImpl) ? accessTypeOrImpl : impl,
            });
    };
}
