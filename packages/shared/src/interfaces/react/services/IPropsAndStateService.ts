import type { PreProcessor } from "@shared/types";
import type { IDescribeRunner } from "@shared/interfaces";

export interface IPropsAndStateService {

    registerWithProps(methodName: string, data: object): void;

    getWithProps(methodName: string): object;

    registerWithState(methodName: string, data: object): void;

    getWithState(methodName: string): object;

    createComponentWithPropsPreProcessor(describeRunner: IDescribeRunner): PreProcessor;

    createWithStatePreProcessor(describeName: string): PreProcessor;
}
