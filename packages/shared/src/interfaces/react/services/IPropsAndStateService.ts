import { PreProcessor } from "@shared/types";

export interface IPropsAndStateService {

    registerWithProps(methodName: string, data: object): void;

    getWithProps(methodName: string): object;

    registerWithState(methodName: string, data: object): void;

    getWithState(methodName: string): object;

    createComponentWithPropsPreProcessor(
        clazzInstance: object,
        componentDataProviderFn: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): PreProcessor;

    createWithStatePreProcessor(describeName: string): PreProcessor;
}