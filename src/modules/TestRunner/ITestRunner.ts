import DescribeManager from "../DescribeManager";

export default interface ITestRunner {

    beforeTestsJestRegistration(describeManager: DescribeManager): void;

    registerTestsInJest(describeManager: DescribeManager): void;

    afterTestsJestRegistration(describeManager: DescribeManager): void;
}
