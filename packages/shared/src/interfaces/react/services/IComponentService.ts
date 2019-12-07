import { ComponentProvider } from "@shared/types";
import { IReactExtension } from "../../../../dist/types/interfaces/react/extensions";
import { IDescribeRunner } from "../../../../dist/types/interfaces/core/runners";

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

    importOrGetComponent(): Promise<unknown>;

    createAndGetDefaultProps(clazzInstance: object, defaultProps?: unknown): object | undefined;

    createComponentContainers(): void;

    createActWrappers(clazzInstance: object): void;

    isComponentProviderRegistered(): boolean;

    runWithAct(method: Function, args: unknown[], isAsync: boolean): unknown;

    inheritComponentProviderWithDefaultProps(
        reactExtension: IReactExtension,
        parentReactExtension: IReactExtension
    ): boolean;

    addComponentToDataProviders(
        reactExtension: IReactExtension,
        describeRunner: IDescribeRunner,
        createComponentPromise: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): void;

    enrichWithDefaultProps(
        defaultProps: object,
        dataProvider: object | object[],
        merge: boolean
    ): object | unknown[];
}
