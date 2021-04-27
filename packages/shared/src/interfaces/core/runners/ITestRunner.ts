import { IDescribeRunner } from "./IDescribeRunner";

export interface ITestRunnerConstructor {
    new(currentTestRunner: ITestRunner): ITestRunner;
}

export interface ITestRunner {

    beforeTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void | Promise<void>;

    registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void;

    afterTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void | Promise<void>;
}
