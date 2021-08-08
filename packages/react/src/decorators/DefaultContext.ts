import type { Class, ComponentContext } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:DefaultContext");

export function DefaultContext(contextType: ComponentContext["contextType"], lib: ComponentContext["lib"] = "react-dom") {
    return function DefaultContextDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        log(`Registering DefaultContext. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; Context type: ${contextType}; Lib: ${lib}`);

        if (reactExtension.getContextService().defaultContext.contextType) {
            throw new SyntaxError("Default context for @ComponentProvider() have already been provided.");
        }

        reactExtension
            .getContextService()
            .registerDefaultContext({ contextType, lib, value: methodName });
    };
}
