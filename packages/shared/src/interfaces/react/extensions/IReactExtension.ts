import { IComponentService } from "../services";

export interface IReactExtension {

    getComponentService(): IComponentService;

    registerWithProps(methodName: string, data: object | object[]): void;

    getWithProps(methodName: string): object | object[];

    registerWithState(methodName: string, data: object): void;

    getWithState(methodName: string): object;
}
