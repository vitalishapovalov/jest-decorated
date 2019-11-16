import { resolveModulePath } from "@jest-decorated/shared";

import { ComponentProvider } from "../types";

export default class ComponentManager {

    private readonly componentProvider: Partial<ComponentProvider> = {};

    private importedComponent: any = null;

    public constructor() {}

    public registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void {
        this.componentProvider.name = name;
        this.componentProvider.source = source;
    }

    public getComponentProvider(): ComponentProvider {
        return this.componentProvider as ComponentProvider;
    }

    public importOrGetComponent<T>(): Promise<T> {
        if (!this.importedComponent) {
            return this.importedComponent = new Promise<T>((resolve) => {
                const component = require(resolveModulePath(this.componentProvider.source));
                resolve(component);
            });
        }
        return this.importedComponent;
    }

    public isComponentProviderRegistered(): boolean {
        return Boolean(this.componentProvider.name);
    }
}
