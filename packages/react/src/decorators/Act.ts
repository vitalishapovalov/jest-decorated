import { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function Act(isAsync?: boolean) {
    return function ActDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        reactExtension
            .getComponentService()
            .registerActWrapper(methodName, isAsync);
    };
}

export function ActAsync(canBeUsedInFuture?: any) {
    return Act(true);
}
