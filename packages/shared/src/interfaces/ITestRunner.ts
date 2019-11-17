import { IDescribeManager } from "./IDescribeManager";

export interface ITestRunnerConstructor {
    new(currentTestRunner: ITestRunner): ITestRunner;
}

export interface ITestRunner {

    beforeTestsJestRegistration(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void;

    registerTestsInJest(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void;

    afterTestsJestRegistration(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void;
}
