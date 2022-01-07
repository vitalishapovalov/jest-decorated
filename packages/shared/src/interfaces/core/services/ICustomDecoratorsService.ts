import type {
    CustomDecoratorHandler,
    CustomDecoratorDefaultArgs,
    CustomDecoratorType,
    CustomDecoratorConfig,
} from "@shared/types";
import type { IDescribeRunner } from "@shared/interfaces";

export interface ICustomDecoratorsService {

    readonly classDecorators: CustomDecoratorConfig[];
    readonly methodDecorators: Map<PropertyKey, CustomDecoratorConfig[]>;

    mergeInAll(
        customDecoratorsService: ICustomDecoratorsService,
        describeRunner: IDescribeRunner
    ): void;

    registerCustomDecorator(
        decoratorType: CustomDecoratorType,
        callbacks: CustomDecoratorHandler,
        args: CustomDecoratorDefaultArgs,
        describeRunner: IDescribeRunner,
        propertyKey?: PropertyKey
    ): void;

    runBeforeTestsRegistrationDecoratorsCallbacks(): void;

    runAfterTestsRegistrationDecoratorsCallbacks(): void;

}
