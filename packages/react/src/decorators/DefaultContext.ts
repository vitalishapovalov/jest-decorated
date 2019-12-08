import { Class, Context } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function DefaultContext(contextType: React.Context<any>, lib: Context["lib"] = "react-dom") {
    return function DefaultContextDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        if (reactExtension.getContextService().defaultContext.contextType) {
            throw new SyntaxError("Default context for @ComponentProvider() have already been provided.");
        }

        reactExtension
            .getContextService()
            .registerDefaultContext({ contextType, lib, value: methodName });
    };
}
