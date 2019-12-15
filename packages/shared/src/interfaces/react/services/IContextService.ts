import { ComponentContext } from "@shared/types";
import { ITestsService, IReactExtension } from "@shared/interfaces";

export interface IContextService {

    readonly defaultContext: Partial<ComponentContext>;

    inheritDefaultContext(parentReactExtension: IReactExtension): void;

    registerDefaultContext(defaultContext: ComponentContext): void;

    registerWithContext(methodName: PropertyKey, context: ComponentContext): void;

    registerContextProcessor(testsService: ITestsService): void;
}
