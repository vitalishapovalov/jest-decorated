import { IComponentService, IPropsAndStateService } from "../services";

export interface IReactExtension {

    getComponentService(): IComponentService;

    getPropsAndStateService(): IPropsAndStateService;
}
