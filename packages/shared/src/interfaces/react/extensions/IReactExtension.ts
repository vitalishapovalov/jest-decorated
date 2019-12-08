import { IComponentService, IContextService, IPropsAndStateService } from "../services";

export interface IReactExtension {

    getComponentService(): IComponentService;

    getPropsAndStateService(): IPropsAndStateService;

    getContextService(): IContextService;
}
