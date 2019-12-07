import { Class } from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export function WithContext(context: object) {
    return function WithContextDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        /*reactExtension
            .registerWithContext(methodName, context);*/
    };
}
