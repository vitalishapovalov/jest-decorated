import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:WithState");

export function WithState(state: object) {
    return function WithStateDecoratorFunc(proto: object, methodName: string) {
        const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

        log(`Registering WithState. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}; State: ${state}`);

        reactExtension
            .getPropsAndStateService()
            .registerWithState(methodName, state);
    };
}
