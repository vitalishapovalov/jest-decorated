import type { Class, ComponentProvider } from "@jest-decorated/shared";
import { isObject, isString } from "@js-utilities/typecheck";

import { ReactExtension } from "../extensions";

export function ComponentProvider(
    pathToComponentOrDefaultProps?: string,
    defaultProps?: ComponentProvider["defaultProps"] | (() => ComponentProvider["defaultProps"])
) {
    return function ComponentProviderDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const componentService = reactExtension.getComponentService();

        if (componentService.isComponentProviderRegistered()) {
            throw new SyntaxError("You can have only one @ComponentProvider per @Describe");
        }

        const firstArgIsDefaultProps = isObject(pathToComponentOrDefaultProps)
            && !isString(pathToComponentOrDefaultProps);

        componentService
            .registerComponentProvider(
                methodName,
                firstArgIsDefaultProps ? undefined : pathToComponentOrDefaultProps
            );
        if (defaultProps || firstArgIsDefaultProps) {
            componentService
                .registerDefaultProps(firstArgIsDefaultProps
                    ? pathToComponentOrDefaultProps
                    : defaultProps
                );
        }
    };
}
