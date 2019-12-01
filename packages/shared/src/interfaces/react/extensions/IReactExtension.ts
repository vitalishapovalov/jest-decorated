import { IComponentService } from "../services";

export interface IReactExtension {

    getComponentService(): IComponentService;

    registerWithProps(methodName: string, data: object): void;

    getWithProps(methodName: string): object;

    registerWithState(methodName: string, data: object): void;

    getWithState(methodName: string): object;
}
