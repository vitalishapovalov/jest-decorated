import type { Class } from "@jest-decorated/shared";
import { isArray, isCallable, isString } from "@js-utilities/typecheck";

import { DescribeRunner } from "../runners";

export function LazyImport(path: string, getter?: ((importedModule: any) => any) | string | string[]) {
    return function LazyImportDecoratorFn(proto: object, name: string) {
        const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);

        if (getter && !isCallable(getter) && !isString(getter) && !isArray(getter)) {
            throw new SyntaxError("@LazyImport 2nd argument must be a string, a function, or an array of strings.");
        }

        describeRunner
            .getImportsService()
            .registerLazyModule({ name, path, getter });
    };
}
