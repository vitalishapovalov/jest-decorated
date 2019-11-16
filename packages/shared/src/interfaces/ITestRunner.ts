import { IDescribeManager } from "./IDescribeManager";

export interface ITestRunnerConstructor {
    new(currentTestRunner: ITestRunner): ITestRunner;
}

export interface ITestRunner {

    beforeTestsJestRegistration(describeManager: IDescribeManager): void;

    registerTestsInJest(describeManager: IDescribeManager): void;

    afterTestsJestRegistration(describeManager: IDescribeManager): void;
}
