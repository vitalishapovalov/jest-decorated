import type {
    CustomDecoratorCallbacks,
    CustomDecoratorConfig,
    CustomDecoratorDefaultArgs,
    ICustomDecoratorsService,
    IDescribeRunner,
    ITestsService,
    PreProcessorData,
} from "@jest-decorated/shared";
import debug from "debug";
import { CustomDecoratorType } from "@jest-decorated/shared";

export class CustomDecoratorsService implements ICustomDecoratorsService {

    private static readonly log = debug("jest-decorated:core:CustomDecoratorService");

    private readonly classDecorators: CustomDecoratorConfig[] = [];
    private readonly methodDecorators: Map<PropertyKey, CustomDecoratorConfig> = new Map();

    public constructor(
       private readonly testsService: ITestsService
    ) {
        this.testsService.registerPreProcessor(this.customDecoratorPreProcessor.bind(this), 1_000);
        this.testsService.registerPostProcessor(this.customDecoratorPostProcessor.bind(this), 0);
    }

    public registerCustomDecorator(
        decoratorType: CustomDecoratorType,
        callbacks: CustomDecoratorCallbacks,
        args: CustomDecoratorDefaultArgs,
        describeRunner: IDescribeRunner,
        propertyKey?: PropertyKey
    ): void {
        CustomDecoratorsService.log("registering custom decorator", { decoratorType, propertyKey, args });
        if (CustomDecoratorType.CLASS === decoratorType) {
            this.classDecorators.push({ callbacks, args, describeRunner });
        } else if (CustomDecoratorType.METHOD === decoratorType) {
            this.methodDecorators.set(propertyKey, { callbacks, args, describeRunner });
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

    private async customDecoratorPreProcessor(preProcessorData: PreProcessorData): Promise<PreProcessorData> {
        await this.executeClassCallback("preProcessor", { preProcessorData });
        return await this.executeMethodCallback(
            "preProcessor",
            preProcessorData.testEntity.name,
            { preProcessorData }
        ) ?? preProcessorData;
    }

    private async customDecoratorPostProcessor(testResult: PreProcessorData, testError?: Error): Promise<void> {
        await this.executeClassCallback("postProcessor", { testResult, testError });
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
        callbackName: keyof CustomDecoratorCallbacks,
        additionalArgs?: { preProcessorData?: PreProcessorData; testResult?: PreProcessorData; testError?: Error }
    ): void | Promise<any[]> {
        const results = [];
        for (const { callbacks, args, describeRunner } of this.classDecorators) {
            if (!callbacks[callbackName]) {
                continue;
            }
            const metadata = {
                args,
                describeRunner,
                methodName: null,
                ...additionalArgs
            };
            try {
                CustomDecoratorsService.log("executing class callback", metadata);
                results.push(callbacks[callbackName](metadata as any));
            } catch (error) {
                CustomDecoratorsService.log("failed to execute class callback for the custom decorator", metadata);
            }
        }
        return Promise.all(results);
    }

    private executeMethodCallback<MethodCallbackResult>(
        callbackName: keyof CustomDecoratorCallbacks,
        matchMethodName?: PropertyKey,
        additionalArgs?: { preProcessorData?: PreProcessorData; testResult?: PreProcessorData; testError?: Error }
    ): MethodCallbackResult | Promise<MethodCallbackResult> {
        let matchedMethodCallbackResult: MethodCallbackResult;
        for (const [methodName, { callbacks, args, describeRunner }] of this.methodDecorators) {
            if (
                !callbacks[callbackName]
                || (matchMethodName && methodName !== matchMethodName)
            ) {
                continue;
            }
            const metadata = {
                args,
                describeRunner,
                methodName: methodName ?? null,
                ...additionalArgs
            };
            try {
                CustomDecoratorsService.log("executing method callback", metadata);
                matchedMethodCallbackResult = callbacks[callbackName](metadata as any);
            } catch (error) {
                CustomDecoratorsService.log("failed to execute method callback for the custom decorator", metadata);
            }
        }
        return matchedMethodCallbackResult;
    }

}
