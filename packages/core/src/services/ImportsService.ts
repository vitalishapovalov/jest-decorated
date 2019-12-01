import { isCallable, isString } from "@js-utilities/typecheck";
import { Class, IImportsService, LazyModule, resolveModule, extractModuleDefault } from "@jest-decorated/shared";

export class ImportsService implements IImportsService {

    private readonly modules: Map<string, () => any> = new Map();

    private readonly resolvedModules: Map<string, any> = new Map();

    public constructor(private readonly clazz: Class) {}

    public registerLazyModule(lazyModule: LazyModule): void {
        this.modules.set(lazyModule.name, () => this.resolveLazyModule(lazyModule));
    }

    public registerLazyModulesInClass(): void {
        for (const [name, resolvedModuleFn] of this.modules.entries()) {
            Object.defineProperty(this.clazz.prototype, name, {
                get(): any {
                    return resolvedModuleFn();
                },
            });
        }
    }

    private resolveLazyModule(lazyModule: LazyModule): any {
        const importedModule = this.importOrGetModule(lazyModule);
        if (lazyModule.getter) {
            const getter = lazyModule.getter;
            return isCallable(getter)
                ? getter(importedModule)
                : isString(getter)
                    ? importedModule[getter]
                    : getter.reduce((obj, key) => obj[key], importedModule);
        }
        return extractModuleDefault(importedModule);
    }

    private importOrGetModule(lazyModule: LazyModule): any {
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
