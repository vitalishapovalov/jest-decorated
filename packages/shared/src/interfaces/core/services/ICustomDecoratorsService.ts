import type { CustomDecoratorCallbacks, CustomDecoratorDefaultArgs, CustomDecoratorType } from "@shared/types";
import type { IDescribeRunner } from "@shared/interfaces";

export interface ICustomDecoratorsService {

    registerCustomDecorator(
        decoratorType: CustomDecoratorType,
        callbacks: CustomDecoratorCallbacks,
        args: CustomDecoratorDefaultArgs,
        describeRunner: IDescribeRunner,
        propertyKey?: PropertyKey
    ): void;

    runBeforeTestsRegistrationDecoratorsCallbacks(): void;

    runAfterTestsRegistrationDecoratorsCallbacks(): void;

}
