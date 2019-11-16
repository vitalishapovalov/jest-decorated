import { Class } from "@jest-decorated/shared";

import ReactExtension from "../modules/ReactExtension";

export function ComponentProvider(pathToComponent?: string) {
    return function ComponentProviderDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);
        const componentManager = reactExtension.getComponentManager();

        if (componentManager.isComponentProviderRegistered()) {
            throw new SyntaxError("You can have only one @ComponentProvider per @Describe");
        }

        componentManager
            .registerComponentProvider(methodName, pathToComponent);
    };
}
