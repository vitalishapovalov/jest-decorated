import type { IDescribeRunner, ITestRunner, TestEntity } from "@jest-decorated/shared";
import debug from "debug";
import { TestType } from "@jest-decorated/shared";
import { isCallable } from "@js-utilities/typecheck";

export class TestRunner implements ITestRunner {

    private static readonly log = debug("jest-decorated:core:TestRunner");

    public static resolveDescription(
        description: string | ((...args: unknown[]) => string),
        args: unknown[] = [],
        providerName?: PropertyKey
    ): string {
        return isCallable(description)
            ? description.apply(null, [...args, providerName])
            : description;
    }

    public registerMocks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering mocks");
        describeRunner.getMocksService().registerMocksInClass();
    }

    public registerAutoCleared(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering auto cleared");
        describeRunner.getMocksService().registerAutoClearedInClass();
    }

    public registerLazyModules(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering lazy modules");
        describeRunner.getImportsService().registerLazyModulesInClass();
    }

    public registerMockFnsAndSpies(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering mock functions and spies");
        describeRunner.getMocksService().registerMockFnsAndSpiesInClass();
    }

    public registerHooks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering hooks");
        describeRunner.getHooksService().registerHooksInJest();
    }

    public registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering tests");
        for (const testEntity of describeRunner.getTestsService().getTests()) {
            this.registerTestInJest(testEntity, describeRunner);
        }
    }

    public registerCustomDecoratorsPre(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering custom decorators pre");
        describeRunner.getCustomDecoratorsService().runBeforeTestsRegistrationDecoratorsCallbacks();
    }

    public registerCustomDecoratorsPost(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        TestRunner.log("Registering custom decorators post");
        describeRunner.getCustomDecoratorsService().runAfterTestsRegistrationDecoratorsCallbacks();
    }

    protected registerTestInJest(testEntity: TestEntity, describeRunner: IDescribeRunner): void {
        const clazzInstance = describeRunner.getClassInstance();
        const testsService = describeRunner.getTestsService();
        const jestTestType = this.resolveJestTestType(testEntity);

        // special case for test.tоdo,
        // cause it should have no implementation at all
        if (testEntity.getTestType() === TestType.TODO) {
            test.todo(TestRunner.resolveDescription(testEntity.description));
            return;
        }

        const registerTestFn = (args: unknown[] = [], providerName?: PropertyKey) => jestTestType(
            TestRunner.resolveDescription(testEntity.description, args, providerName),
            async () => {
                const preProcessorResult = await testsService.runPreProcessors({
                    clazzInstance,
                    testEntity,
                    args,
                });
                let testError: Error;
                try {
                    await preProcessorResult
                        .clazzInstance[preProcessorResult.testEntity.name]
                        .apply(preProcessorResult.clazzInstance, preProcessorResult.args);
                } catch (e) {
                    testError = e;
                }
                try {
                    await testsService.runPostProcessors(preProcessorResult, testError);
                } catch (e) {
                    console.error("Failed to execute postProcessor: ", e);
                }
                if (testError) {
                    throw testError;
                }
            },
            testEntity.timeout
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

    protected resolveJestTestType(testEntity: TestEntity): typeof test {
        switch (testEntity.getTestType()) {
            case TestType.ONLY:
                return test.only;
            case TestType.SKIP:
                return test.skip;
            case TestType.TODO:
                return test.todo;
            case TestType.CONCURRENT:
                return test.concurrent;
            case TestType.DEFAULT:
            default:
                return test;
        }
    }
}
