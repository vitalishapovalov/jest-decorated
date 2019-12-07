import * as path from "path";

import { NODE_MODULES } from "./constants";

export const resolveModule = (
    module: string,
    registrar: (modulePath: string) => any = require
): any => {
    const isRelativePath = module.startsWith(".");
    const testPath = (jasmine as any).testPath;

    if (isRelativePath) {
        return registrar(path.join(testPath, "/../", module));
    }

    try {
        return registrar(module);
    } catch {
        const { INIT_CWD, PWD } = (jasmine as any).process.env;
        const pathWithNodeModules = (nodeModulesRoot: string): string => nodeModulesRoot
            + "/"
            + NODE_MODULES
            + "/"
            + module;
        try {
            return registrar(pathWithNodeModules(INIT_CWD));
        } catch {
            try {
                return registrar(pathWithNodeModules(PWD));
            } catch {
                throw new EvalError(`@jest-decorated: FAILED TO RESOLVE MODULE. MODULE PATH: ${module}.`);
            }
        }
    }
};

export const extractModuleDefault = (module: { default?: unknown; __esModule?: boolean; }): any => {
    if (
        module
        && module.default
        && (
            Object.keys(module).length === 1
            || (Object.keys(module).length === 2 && module.__esModule)
        )
    ) {
        return module.default;
    }
    return module;
};
