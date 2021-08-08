import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:ComponentContainer");

export function ComponentContainer(tagName: keyof HTMLElementTagNameMap = "div") {
    return function ComponentContainerDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        log(`Registering ComponentContainer. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; Tag name: ${tagName}`);

        reactExtension
            .getComponentService()
            .registerComponentContainer(methodName, tagName);
    };
}
