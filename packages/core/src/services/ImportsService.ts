import type { Class, IImportsService, LazyModule } from "@jest-decorated/shared";
import { resolveModule, extractModuleDefault } from "@jest-decorated/shared";
import { isCallable, isString } from "@js-utilities/typecheck";

export class ImportsService implements IImportsService {

    private readonly modules: Map<string, () => unknown> = new Map();

    private readonly resolvedModules: Map<string, unknown> = new Map();

    public constructor(private readonly clazz: Class) {}

    public registerLazyModule(lazyModule: LazyModule): void {
        this.modules.set(lazyModule.name, () => this.resolveLazyModule(lazyModule));
    }

    public registerLazyModulesInClass(): void {
        for (const [name, resolvedModuleFn] of this.modules.entries()) {
            Object.defineProperty(this.clazz.prototype, name, {
                get(): unknown {
                    return resolvedModuleFn();
                },
                configurable: true,
            });
        }
    }

    private resolveLazyModule(lazyModule: LazyModule): unknown {
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
