import type { Class, IImportsService, LazyModule } from "@jest-decorated/shared";
import debug from "debug";
import { resolveModule, extractModuleDefault } from "@jest-decorated/shared";
import { isCallable, isString } from "@js-utilities/typecheck";

export class ImportsService implements IImportsService {

    private static readonly log = debug("jest-decorated:core:ImportsService");

    private readonly modules: Map<string, () => unknown> = new Map();

    private readonly resolvedModules: Map<string, unknown> = new Map();

    public constructor(private readonly clazz: Class) {
        ImportsService.log("New instance crated");
    }

    public registerLazyModule(lazyModule: LazyModule): void {
        ImportsService.log(`Registering lazy module: ${lazyModule}`);
        this.modules.set(lazyModule.name, () => this.resolveLazyModule(lazyModule));
    }

    public registerLazyModulesInClass(): void {
        ImportsService.log("Registering lazy modules in class...");
        for (const [name, resolvedModuleFn] of this.modules.entries()) {
            ImportsService.log(`Registering lazy module in class. Name: ${name}`);
            Object.defineProperty(this.clazz.prototype, name, {
                get(): unknown {
                    return resolvedModuleFn();
                },
                configurable: true,
            });
        }
        ImportsService.log("Registering lazy modules in class DONE");
    }

    private resolveLazyModule(lazyModule: LazyModule): unknown {
        ImportsService.log(`Resolving lazy module: ${lazyModule}`);
        const importedModule = extractModuleDefault(this.importOrGetModule(lazyModule));
        if (lazyModule.getter) {
            const getter = lazyModule.getter;
            return isCallable(getter)
                ? getter(importedModule)
                : isString(getter)
                    ? importedModule[getter]
                    : getter.reduce((obj, key) => obj[key], importedModule);
        }
        return importedModule;
    }

    private importOrGetModule(lazyModule: LazyModule): unknown {
        const registeredModule = this.getModulePathRegisteredName(lazyModule.path);
        if (registeredModule) {
            return this.resolvedModules.get(registeredModule);
        }
        const importedModule = resolveModule(lazyModule.path);
        this.resolvedModules.set(lazyModule.path, importedModule);
        return importedModule;
    }

    private getModulePathRegisteredName(modulePath: string): string {
        for (const path of this.resolvedModules.keys()) {
            if (modulePath === path) return path;
        }
        return null;
    }
}
