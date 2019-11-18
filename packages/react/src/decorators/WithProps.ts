import { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function WithProps(props: object | object[]) {
    return function WithPropsDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        reactExtension
            .registerWithProps(methodName, props);
    };
}
