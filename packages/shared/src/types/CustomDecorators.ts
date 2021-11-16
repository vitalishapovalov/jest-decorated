import type { IDescribeRunner } from "@shared/interfaces";
import type { Class, PreProcessorData } from "@shared/types";

export enum CustomDecoratorType {
    CLASS = "class",
    METHOD = "method",
}

export type CustomDecoratorDefaultArgs = any[];

export type CustomDecorator<Args extends CustomDecoratorDefaultArgs> = (...args: Args) =>
    (target: object | Class, propertyKey?: PropertyKey, propertyDescriptor?: PropertyDescriptor) => any;

export type CustomDecoratorCallbackMetadata<Args> = {
    args: Args;
    describeRunner: IDescribeRunner;
    methodName: PropertyKey | null;
};

export type CustomDecoratorPreProcessorMetadata<Args> = CustomDecoratorCallbackMetadata<Args> & {
    preProcessorData: PreProcessorData;
};

export type CustomDecoratorPostProcessorMetadata<Args> = CustomDecoratorCallbackMetadata<Args> & {
    testResult?: PreProcessorData;
    testError?: Error;
};

export type CustomDecoratorHandler<Args = CustomDecoratorDefaultArgs> = {
    beforeTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
    afterTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
    preProcessor?(metadata: CustomDecoratorPreProcessorMetadata<Args>): PreProcessorData | Promise<PreProcessorData>;
    postProcessor?(metadata: CustomDecoratorPostProcessorMetadata<Args>): void | Promise<void>;
};

export interface CustomDecoratorHandlerConstructor<Args = CustomDecoratorDefaultArgs> {
    new (
        args: Args,
        target: Class,
        propertyKey?: PropertyKey,
        propertyDescriptor?: PropertyDescriptor
    ): CustomDecoratorHandler<Args>;
}

export type CustomDecoratorConfig = {
    handler: CustomDecoratorHandler;
    args: CustomDecoratorDefaultArgs;
    describeRunner: IDescribeRunner;
};
