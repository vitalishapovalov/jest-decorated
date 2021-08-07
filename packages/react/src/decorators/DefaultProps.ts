import type { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function DefaultProps() {
    return function DefaultPropsDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        if (reactExtension.getComponentService().componentProvider.defaultProps) {
            throw new SyntaxError("Default props for @ComponentProvider() have already been provided.");
        }

        reactExtension
            .getComponentService()
            .registerDefaultProps(methodName);
    };
}
