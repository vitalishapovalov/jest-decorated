import { ComponentProvider } from "@shared/types";

export interface IComponentService {

    readonly componentProvider: Partial<ComponentProvider>;

    registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void;

    importOrGetComponent<T>(): Promise<T>;

    isComponentProviderRegistered(): boolean;
}
