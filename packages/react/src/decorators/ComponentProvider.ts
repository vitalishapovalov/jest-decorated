import { Class, ComponentProvider } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function ComponentProvider(
    pathToComponent?: string,
    defaultProps?: ComponentProvider["defaultProps"] | (() => ComponentProvider["defaultProps"])
) {
    return function ComponentProviderDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const componentService = reactExtension.getComponentService();

        if (componentService.isComponentProviderRegistered()) {
            throw new SyntaxError("You can have only one @ComponentProvider per @Describe");
        }

        componentService
            .registerComponentProvider(methodName, pathToComponent);
        if (defaultProps) {
            componentService
                .registerDefaultProps(defaultProps);
        }
    };
}
