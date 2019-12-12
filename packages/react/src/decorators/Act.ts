import { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function Act() {
    return function ActDecoratorFunc(proto: object, methodName: string) {
        registerAct(proto, methodName, false);
    };
}

export function ActAsync() {
    return function ActAsyncDecoratorFunc(proto: object, methodName: string) {
        registerAct(proto, methodName, true);
    };
}

function registerAct(proto: object, methodName: string, isAsync: boolean) {
    const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

    reactExtension
        .getComponentService()
        .registerActWrapper(methodName, isAsync);
}
