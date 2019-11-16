import { isCallable } from "@js-utilities/typecheck";
import { IDescribeManager, ITestRunner, TestEntity } from "@jest-decorated/shared";

export default class DefaultTestRunner implements ITestRunner {

    public static resolveDescription(
        description: string | ((...args: any[]) => string),
        args: any[] = [],
        providerName?: PropertyKey
    ): string {
        return isCallable(description)
            ? description.apply(null, [providerName, ...args])
            : description;
    }

    public async beforeTestsJestRegistration(describeManager: IDescribeManager): Promise<void> {
    }

    public registerTestsInJest(describeManager: IDescribeManager): void {
        for (const testEntity of describeManager.getTestsManager().getTests()) {
            this.registerTestInJest(testEntity, describeManager);
        }
    }

    public async afterTestsJestRegistration(describeManager: IDescribeManager): Promise<void> {
    }

    protected registerTestInJest(testEntity: TestEntity, describeManager: IDescribeManager): void {
        const clazzInstance = describeManager.getClassInstance();
        const testsManager = describeManager.getTestsManager();
        const registerTest = (args: any[] = [], providerName?: PropertyKey) => test(
            DefaultTestRunner.resolveDescription(testEntity.description, args, providerName),
            async () => {
                const preProcessorResult = await testsManager.runPreProcessors({
                    clazzInstance,
                    testEntity,
                    args,
                });
                const testResult = await preProcessorResult
                    .clazzInstance[preProcessorResult.testEntity.name]
                    .apply(preProcessorResult.clazzInstance, preProcessorResult.args);
                await testsManager.runPostProcessors(testResult);
            }
        );
        if (!testEntity.dataProviders.length) {
            registerTest();
        } else {
            this.registerDataProvidersTest(testEntity, describeManager, registerTest);
        }
    }

    protected registerDataProvidersTest(
        testEntity: TestEntity,
        describeManager: IDescribeManager,
        registerFn: (args: any[], providerName?: PropertyKey) => any
    ) {
        const testsManager = describeManager.getTestsManager();
        const dataProvidersData = testEntity.dataProviders
            .map<any[][]>(testsManager.getDataProvider.bind(testsManager));
        testEntity.dataProviders
            .reduce<Map<PropertyKey, any[][]>>(
                (map, name, i) => {
                    dataProvidersData[i].forEach((args) => {
                        const currArgs = map.get(name) || [];
                        currArgs.push(args);
                        map.set(name, currArgs);
                    });
                    return map;
                },
                new Map()
            )
            .forEach(
                (argsArr, name) => argsArr.forEach(args => registerFn(args, name))
            );
    }
}
