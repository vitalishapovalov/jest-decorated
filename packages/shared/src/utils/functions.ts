import * as path from "path";

import { NODE_MODULES } from "./constants";

export const toString = (value: any): string => ({}).toString.call(value);

export const resolveModule = (modulePath: string): any => {
    const isRelativePath = modulePath.startsWith(".");
    const testPath = (jasmine as any).testPath;

    if (isRelativePath) {
        return require(path.join(testPath, "/../", modulePath));
    }

    try {
        return require(modulePath);
    } catch {
        const { INIT_CWD, PWD } = (jasmine as any).process.env;
        const pathWithNodeModules = (nodeModulesRoot: string): string => nodeModulesRoot
            + "/"
            + NODE_MODULES
            + "/"
            + modulePath;
        try {
            return require(pathWithNodeModules(INIT_CWD));
        } catch {
            try {
                return require(pathWithNodeModules(PWD));
            } catch {
                throw new EvalError(`@jest-decorated: FAILED TO RESOLVE MODULE. MODULE PATH: ${modulePath}.`);
            }
        }
    }
};
