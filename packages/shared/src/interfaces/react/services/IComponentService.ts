import { ComponentProvider } from "@shared/types";

export interface IComponentService {

    readonly componentProvider: Partial<ComponentProvider>;

    registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void;

    getComponentProvider(): ComponentProvider;

    registerActWrapper(name: string, isAsync: boolean): void;

    registerComponentContainer(name: string, tagName?: keyof HTMLElementTagNameMap): void;

    importOrGetComponent<T>(): Promise<T>;

    createComponentContainers(): void;

    createActWrappers(clazzInstance: object): void;

    isComponentProviderRegistered(): boolean;

    runWithAct(method: Function, args: any[], isAsync: boolean): any;
}
