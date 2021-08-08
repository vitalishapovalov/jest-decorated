import type { IDescribeRunner } from "./IDescribeRunner";

export interface ITestRunnerConstructor {
    new(currentTestRunner: ITestRunner): ITestRunner;
}

export interface ITestRunner {

    registerMocks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    registerAutoCleared(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    registerLazyModules(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    registerMockFnsAndSpies(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    registerHooks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;
}
