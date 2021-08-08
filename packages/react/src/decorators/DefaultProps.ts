import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:DefaultProps");

export function DefaultProps() {
    return function DefaultPropsDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        log(`Registering DefaultProps. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);

        if (reactExtension.getComponentService().componentProvider.defaultProps) {
            throw new SyntaxError("Default props for @ComponentProvider() have already been provided.");
        }

        reactExtension
            .getComponentService()
            .registerDefaultProps(methodName);
    };
}
