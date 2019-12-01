import { ComponentProvider } from "@shared/types";

export interface IComponentService {

    readonly componentProvider: Partial<ComponentProvider>;

    registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void;

    getComponentProvider(): ComponentProvider;

    registerDefaultProps(defaultProps: ComponentProvider["defaultProps"]): void;

    registerActWrapper(name: string, isAsync: boolean): void;

    registerComponentContainer(name: string, tagName?: keyof HTMLElementTagNameMap): void;

    importOrGetComponent<T>(): Promise<T>;

    createAndGetDefaultProps(clazzInstance: object, defaultProps?: any): object | undefined;

    createComponentContainers(): void;

    createActWrappers(clazzInstance: object): void;

    isComponentProviderRegistered(): boolean;

    runWithAct(method: Function, args: any[], isAsync: boolean): any;
}
