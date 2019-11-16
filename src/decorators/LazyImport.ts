import { Class } from "@jest-decorated/shared";
import { isArray, isCallable, isString } from "@js-utilities/typecheck";

import DescribeManager from "../modules/DescribeManager";

export function LazyImport(path: string, getter?: ((importedModule: any) => any) | string | string[]) {
    return function LazyImportDecoratorFn(proto: object, name: string) {
        const describeManager = DescribeManager.getDescribeManager(proto.constructor as Class);

        if (getter && !isCallable(getter) && !isString(getter) && !isArray(getter)) {
            throw new SyntaxError("@LazyImport 2nd argument must be a string or a function.");
        }

        return describeManager
            .getImportsManager()
            .registerLazyModule({ name, path, getter });
    }
}