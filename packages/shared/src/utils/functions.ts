import * as path from "path";

export const toString = (value: any): string => ({}).toString.call(value);

export const resolveModulePath = (modulePath: string): string => {
    const isRelativePath = modulePath.startsWith(".");
    return isRelativePath
        ? path.join((jasmine as any).testPath, "/../", modulePath)
        : modulePath;
};
