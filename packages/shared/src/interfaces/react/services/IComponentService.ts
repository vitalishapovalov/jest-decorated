import { ComponentProvider } from "@shared/types";
import { IReactExtension } from "@shared/interfaces";

export interface IComponentService {

    readonly componentProvider: Partial<ComponentProvider>;

    registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void;

    getComponentProvider(): ComponentProvider;

    registerDefaultProps(defaultProps: ComponentProvider["defaultProps"]): void;

    registerActWrapper(name: string, isAsync: boolean): void;

    registerComponentContainer(name: string, tagName: keyof HTMLElementTagNameMap): void;

    importOrGetComponent(): Promise<unknown>;

    createComponentContainers(): void;

    createActWrappers(clazzInstance: object): void;

    isComponentProviderRegistered(): boolean;

    runWithAct(method: Function, args: unknown[], isAsync: boolean): unknown;

    inheritComponentProviderWithDefaultProps(parentReactExtension: IReactExtension): boolean;
}
