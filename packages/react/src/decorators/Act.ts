import type { Class } from "@jest-decorated/shared";
import debug from "debug";

import { ReactExtension } from "../extensions";

const log = debug("jest-decorated:react:decorators:Act/ActAsync");

export function Act() {
    return function ActDecoratorFunc(proto: object, methodName: string) {
        log(`Registering Act. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);
        registerAct(proto, methodName, false);
    };
}

export function ActAsync() {
    return function ActAsyncDecoratorFunc(proto: object, methodName: string) {
        log(`Registering ActAsync. Method name: ${String(methodName)}; Class name: ${proto.constructor.name}`);
        registerAct(proto, methodName, true);
    };
}

function registerAct(proto: object, methodName: string, isAsync: boolean) {
    const reactExtension = ReactExtension.getReactExtension(proto.constructor as Class);

    reactExtension
        .getComponentService()
        .registerActWrapper(methodName, isAsync);
}
