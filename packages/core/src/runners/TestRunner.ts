import { isCallable } from "@js-utilities/typecheck";
import { IDescribeRunner, ITestRunner, TestEntity } from "@jest-decorated/shared";

export class TestRunner implements ITestRunner {

    public static resolveDescription(
        description: string | ((...args: any[]) => string),
        args: any[] = [],
        providerName?: PropertyKey
    ): string {
        return isCallable(description)
            ? description.apply(null, [providerName, ...args])
            : description;
    }

    public beforeTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        describeRunner.getImportsService().registerLazyModulesInClass();
        describeRunner.getMocksService().registerMockFnsAndSpiesInClass();
    }

    public registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        for (const testEntity of describeRunner.getTestsService().getTests()) {
            this.registerTestInJest(testEntity, describeRunner);
        }
    }

    public afterTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {}

    protected registerTestInJest(testEntity: TestEntity, describeRunner: IDescribeRunner): void {
        const clazzInstance = describeRunner.getClassInstance();
        const testsService = describeRunner.getTestsService();
        const registerTest = (args: any[] = [], providerName?: PropertyKey) => test(
            TestRunner.resolveDescription(testEntity.description, args, providerName),
            async () => {
                const preProcessorResult = await testsService.runPreProcessors({
                    clazzInstance,
                    testEntity,
                    args,
                });
                const testResult = await preProcessorResult
                    .clazzInstance[preProcessorResult.testEntity.name]
                    .apply(preProcessorResult.clazzInstance, preProcessorResult.args);
                await testsService.runPostProcessors(testResult);
            }
        );
        if (!testEntity.dataProviders.length) {
            registerTest();
        } else {
            this.registerDataProvidersTest(testEntity, describeRunner, registerTest);
        }
    }

    protected registerDataProvidersTest(
        testEntity: TestEntity,
        describeRunner: IDescribeRunner,
        registerFn: (args: any[], providerName?: PropertyKey) => any
    ) {
        const testsService = describeRunner.getTestsService();
        const dataProvidersData = testEntity.dataProviders
            .map<any[][]>(testsService.getDataProvider.bind(testsService));
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
