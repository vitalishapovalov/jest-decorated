import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:WithProps");

export function WithProps(props: object) {
    return function WithPropsDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        log(`Registering WithProps. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; Props: ${props}`);

        reactExtension
            .getPropsAndStateService()
            .registerWithProps(methodName, props);
    };
}
