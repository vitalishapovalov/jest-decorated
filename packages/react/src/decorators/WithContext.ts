import { Class, Context } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function WithContext(
    contextTypeOrValue: React.Context<object> | object,
    value?: object,
    lib: Context["lib"] = "react-dom"
) {
    return function WithContextDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const firstArg$$typeof = (contextTypeOrValue as any).$$typeof;
        const firstArgIsContextType = firstArg$$typeof === Symbol.for("react.context")
            || firstArg$$typeof === 0xeace;

        reactExtension
            .getContextService()
            .registerWithContext(methodName, {
                lib,
                contextType: firstArgIsContextType
                    ? contextTypeOrValue as React.Context<object>
                    : null,
                value: firstArgIsContextType
                    ? value
                    : contextTypeOrValue,
            });
    };
}
