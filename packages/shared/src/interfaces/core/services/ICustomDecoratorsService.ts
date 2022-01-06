import type {
    CustomDecoratorHandler,
    CustomDecoratorDefaultArgs,
    CustomDecoratorType,
    CustomDecoratorConfig,
} from "@shared/types";
import type { IDescribeRunner } from "@shared/interfaces";

export interface ICustomDecoratorsService {

    getCustomDecorators(): {
        classDecorators: CustomDecoratorConfig[];
        methodDecorators: Map<PropertyKey, CustomDecoratorConfig[]>;
    };

    mergeInAll(customDecoratorsService: ICustomDecoratorsService): void;

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
