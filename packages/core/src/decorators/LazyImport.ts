import type { Class } from "@jest-decorated/shared";
import debug from "debug";
import { isArray, isCallable, isString } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

const log = debug("jest-decorated:core:decorators:LazyImport");

export function LazyImport(path: string, getter?: ((importedModule: any) => any) | string | string[]) {
    return function LazyImportDecoratorFn(proto: object, propName: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        log(`Registering LazyImport. Property name: ${propName}; Class name: ${proto.constructor.name}; Path: ${path}`);

        if (getter && !isCallable(getter) && !isString(getter) && !isArray(getter)) {
            throw new SyntaxError("@LazyImport 2nd argument must be a string, a function, or an array of strings.");
        }

        describeRunner
            .getImportsService()
            .registerLazyModule({ path, getter, name: propName });
    };
}
