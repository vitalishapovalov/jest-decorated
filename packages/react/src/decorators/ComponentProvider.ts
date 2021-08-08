import type { Class, ComponentProvider } from "@jest-decorated/shared";
import debug from "debug";
import { isObject, isString } from "@js-utilities/typecheck";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:ComponentProvider");

export function ComponentProvider(
    pathToComponentOrDefaultProps?: string,
    defaultProps?: ComponentProvider["defaultProps"] | (() => ComponentProvider["defaultProps"])
) {
    return function ComponentProviderDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const componentService = reactExtension.getComponentService();

        log(`Registering ComponentProvider. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; Path to module or default props: ${pathToComponentOrDefaultProps}; Default props: ${defaultProps}`);

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
