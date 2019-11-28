import { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function ComponentContainer(tagName?: keyof HTMLElementTagNameMap) {
    return function ComponentContainerDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        reactExtension
            .getComponentService()
            .registerComponentContainer(methodName, tagName);
    };
}
