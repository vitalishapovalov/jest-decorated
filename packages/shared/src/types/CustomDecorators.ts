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

export type CustomDecoratorCallbacks<Args = CustomDecoratorDefaultArgs> = {
    beforeTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
    afterTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
    preProcessor?(metadata: CustomDecoratorPreProcessorMetadata<Args>): PreProcessorData | void;
    postProcessor?(metadata: CustomDecoratorPostProcessorMetadata<Args>): void;
};

export type CustomDecoratorConfig = {
    callbacks: CustomDecoratorCallbacks;
    args: CustomDecoratorDefaultArgs;
    describeRunner: IDescribeRunner;
};
