import type { Class, ComponentContext } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:WithContext");

export function WithContext(
    contextTypeOrValue: ComponentContext["contextType"] | object,
    value?: object,
    lib: ComponentContext["lib"] = "react-dom"
) {
    return function WithContextDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const firstArg$$typeof = (contextTypeOrValue as any).$$typeof;
        const firstArgIsContextType = firstArg$$typeof === Symbol.for("react.context")
            || firstArg$$typeof === 0xeace;

        log(`Registering WithContext. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; Context type or value: ${contextTypeOrValue}; value: ${value}; Lib: ${lib}`);

        reactExtension
            .getContextService()
            .registerWithContext(methodName, {
                lib,
                contextType: firstArgIsContextType
                    ? contextTypeOrValue as ComponentContext["contextType"]
                    : null,
                value: firstArgIsContextType
                    ? value
                    : contextTypeOrValue,
            });
    };
}
