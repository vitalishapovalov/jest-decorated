import type {
    CustomDecoratorHandler,
    CustomDecoratorConfig,
    CustomDecoratorDefaultArgs,
    ICustomDecoratorsService,
    IDescribeRunner,
    ITestsService,
    PreProcessorData,
} from "@jest-decorated/shared";
import debug from "debug";
import { isPromise } from "@js-utilities/typecheck";
import { CustomDecoratorType } from "@jest-decorated/shared";

export class CustomDecoratorsService implements ICustomDecoratorsService {

    private static readonly log = debug("jest-decorated:core:CustomDecoratorService");

    public readonly classDecorators: CustomDecoratorConfig[] = [];
    public readonly methodDecorators: Map<PropertyKey, CustomDecoratorConfig[]> = new Map();

    public constructor(
       private readonly testsService: ITestsService
    ) {
        this.testsService.registerPreProcessor(this.customDecoratorPreProcessor.bind(this), 1_000);
        this.testsService.registerPostProcessor(this.customDecoratorPostProcessor.bind(this), 0);
    }

    public registerCustomDecorator(
        decoratorType: CustomDecoratorType,
        handler: CustomDecoratorHandler,
        args: CustomDecoratorDefaultArgs,
        describeRunner: IDescribeRunner,
        propertyKey?: PropertyKey
    ): void {
        CustomDecoratorsService.log("registering custom decorator", { decoratorType, propertyKey, args });
        if (CustomDecoratorType.CLASS === decoratorType) {
            this.classDecorators.push({ handler, args, describeRunner });
        } else if (CustomDecoratorType.METHOD === decoratorType) {
            if (this.methodDecorators.has(propertyKey)) {
                this.methodDecorators.get(propertyKey).push({ handler, args, describeRunner });
            } else {
                this.methodDecorators.set(propertyKey, [{ handler, args, describeRunner }]);
            }
        }
    }

    public runBeforeTestsRegistrationDecoratorsCallbacks(): void {
        this.executeClassCallback("beforeTestsRegistration");
        this.executeMethodCallback("beforeTestsRegistration");
    }

    public runAfterTestsRegistrationDecoratorsCallbacks(): void {
        this.executeClassCallback("afterTestsRegistration");
        this.executeMethodCallback("afterTestsRegistration");
    }

    public mergeInAll(
        customDecoratorsService: ICustomDecoratorsService,
        describeRunner: IDescribeRunner
    ): void {
        CustomDecoratorsService.log(`Merging in custom decorators from the service: ${String(customDecoratorsService)}`);
        this.classDecorators.push(...customDecoratorsService.classDecorators.map(customDecorator => ({
            ...customDecorator,
            describeRunner,
        })));
        for (const [propertyKey, customDecorators] of customDecoratorsService.methodDecorators) {
            const customDecoratorsWithUpdatedDescribe = customDecorators.map(customDecorator => ({
                ...customDecorator,
                describeRunner,
            }));
            if (this.methodDecorators.has(propertyKey)) {
                this.methodDecorators.get(propertyKey).push(...customDecoratorsWithUpdatedDescribe);
            } else {
                this.methodDecorators.set(propertyKey, customDecoratorsWithUpdatedDescribe);
            }
        }
    }

    private async customDecoratorPreProcessor(preProcessorData: PreProcessorData): Promise<PreProcessorData> {
        this.executeClassCallback("preProcessor", { preProcessorData });
        return await this.executeMethodCallback(
            "preProcessor",
            preProcessorData.testEntity.name,
            { preProcessorData }
        ) ?? preProcessorData;
    }

    private async customDecoratorPostProcessor(testResult: PreProcessorData, testError?: Error): Promise<void> {
        this.executeClassCallback("postProcessor", { testResult, testError });
        if (!testResult || !testResult.testEntity) {
            CustomDecoratorsService.log(
                "skipping custom decorator post processor method callback - no test result and/or no testEntity found",
                testResult
            );
            return;
        }
        await this.executeMethodCallback(
            "postProcessor",
            testResult.testEntity.name,
            { testResult, testError }
        );
    }

    private executeClassCallback(
        callbackName: keyof CustomDecoratorHandler,
        additionalArgs?: { preProcessorData?: PreProcessorData; testResult?: PreProcessorData; testError?: Error }
    ): void {
        const results = [];
        for (const { handler, args, describeRunner } of this.classDecorators) {
            if (!handler[callbackName]) {
                CustomDecoratorsService.log("no handler found for class callback", { args, callbackName });
                continue;
            }
            const metadata: any = {
                args,
                describeRunner,
                methodName: null,
                ...additionalArgs
            };
            try {
                CustomDecoratorsService.log("executing class callback", { args, callbackName });
                results.push(handler[callbackName](metadata));
            } catch (error) {
                CustomDecoratorsService.log("failed to execute class callback for the custom decorator", { args, callbackName });
            }
        }
    }

    private executeMethodCallback<MethodCallbackResult>(
        callbackName: keyof CustomDecoratorHandler,
        matchMethodName?: PropertyKey,
        additionalArgs?: { preProcessorData?: PreProcessorData; testResult?: PreProcessorData; testError?: Error }
    ): MethodCallbackResult | Promise<MethodCallbackResult> {
        let matchedMethodCallbackResult: MethodCallbackResult;
        for (const [methodName, methodDecoratorsConfigs] of this.methodDecorators) {
            if (matchMethodName && (matchMethodName !== methodName)) {
                CustomDecoratorsService.log("skipping non-matched method callback", { callbackName, methodName });
                continue;
            }
            for (const { handler, args, describeRunner } of methodDecoratorsConfigs) {
                if (!handler[callbackName]) {
                    CustomDecoratorsService.log("no handler found for method callback", { args, callbackName, methodName });
                    continue;
                }
                const metadata: any = {
                    args,
                    describeRunner,
                    methodName: methodName ?? null,
                    ...additionalArgs
                };
                try {
                    CustomDecoratorsService.log("executing method callback", { args, methodName });
                    if (isPromise(matchedMethodCallbackResult)) {
                        matchedMethodCallbackResult = matchedMethodCallbackResult
                            .then(() => handler[callbackName](metadata)) as unknown as MethodCallbackResult;
                    } else {
                        matchedMethodCallbackResult = handler[callbackName](metadata);
                    }
                } catch (error) {
                    CustomDecoratorsService.log("failed to execute method callback for the custom decorator", { args, methodName });
                }
            }
        }
        return matchedMethodCallbackResult;
    }

}
