import { isCallable } from "@js-utilities/typecheck";
import { IDescribeRunner, ITestRunner, TestEntity } from "@jest-decorated/shared";

export class TestRunner implements ITestRunner {

    public static resolveDescription(
        description: string | ((...args: unknown[]) => string),
        args: unknown[] = [],
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
        const registerTestFn = (args: unknown[] = [], providerName?: PropertyKey) => test(
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
            registerTestFn();
        } else {
            this.registerDataProvidersTest(testEntity, describeRunner, registerTestFn);
        }
    }

    protected registerDataProvidersTest(
        testEntity: TestEntity,
        describeRunner: IDescribeRunner,
        registerTestFn: (args: unknown[], providerName?: PropertyKey) => unknown
    ) {
        const testsService = describeRunner.getTestsService();
        const dataProvidersData = testEntity.dataProviders
            .map<unknown[][]>(testsService.getDataProvider.bind(testsService));

        testEntity.dataProviders
            .reduce<Map<PropertyKey, unknown[]>>(
                (map, name, i) => {
                    dataProvidersData[i].forEach((arg) => {
                        const argsArr = map.get(name) || [];
                        argsArr.push(arg);
                        map.set(name, argsArr);
                    });
                    return map;
                },
                new Map()
            )
            .forEach(
                (argsArr, name) => argsArr.forEach(args => registerTestFn([args], name))
            );
    }
}
