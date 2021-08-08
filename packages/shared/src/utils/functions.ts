import debug from "debug";
import * as path from "path";

import { NODE_MODULES } from "./constants";

const logResolveModule = debug("jest-decorated:shared:utils:resolveModule");
const logExtractModuleDefault = debug("jest-decorated:shared:utils:extractModuleDefault");

export const resolveModule = (
    module: string,
    registrar: (modulePath: string) => any = require
): any => {
    const isRelativePath = module.startsWith(".");
    const testPath = expect.getState().testPath;

    logResolveModule(`Start module resolving. Module: ${module}; Test path: ${testPath}`);

    if (isRelativePath) {
        const resolvedPath = path.join(testPath, "/../", module);
        logResolveModule(`Resolved relative path. Path: ${resolvedPath}`);
        return registrar(resolvedPath);
    }

    try {
        logResolveModule("Trying to resolve module with plain registrar");
        return registrar(module);
    } catch {
        const { INIT_CWD, PWD } = process.env;
        const pathWithNodeModules = (nodeModulesRoot: string): string => nodeModulesRoot
            + "/"
            + NODE_MODULES
            + "/"
            + module;
        try {
            const resolvedPath = pathWithNodeModules(INIT_CWD);
            logResolveModule(`Trying to resolve module with INIT_CWD: ${INIT_CWD}; path: ${resolvedPath}`);
            return registrar(resolvedPath);
        } catch {
            try {
                const resolvedPath = pathWithNodeModules(PWD);
                logResolveModule(`Trying to resolve module with PWD: ${PWD}; path: ${resolvedPath}`);
                return registrar(resolvedPath);
            } catch {
                throw new EvalError(`@jest-decorated: FAILED TO RESOLVE MODULE. MODULE PATH: ${module}.`);
            }
        }
    }
};

export const extractModuleDefault = (module: { default?: unknown; __esModule?: boolean; }): any => {
    const moduleKeysLength = Object.keys(module).length;
    logExtractModuleDefault(`Extracting module default. module: ${module}; module keys length: ${moduleKeysLength}`);
    if (
        module
        && module.default
        && (
            moduleKeysLength === 1 || (moduleKeysLength === 2 && module.__esModule)
        )
    ) {
        return module.default;
    }
    return module;
};
