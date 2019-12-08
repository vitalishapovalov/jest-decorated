import { Context } from "@shared/types";
import { ITestsService, IReactExtension } from "@shared/interfaces";

export interface IContextService {

    readonly defaultContext: Partial<Context>;

    inheritDefaultContext(parentReactExtension: IReactExtension): void;

    registerDefaultContext(defaultContext: Context): void;

    registerWithContext(methodName: PropertyKey, context: Context): void;

    registerContextProcessor(testsService: ITestsService): void;
}