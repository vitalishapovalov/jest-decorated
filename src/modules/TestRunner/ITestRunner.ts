import DescribeManager from "../DescribeManager";

export default interface ITestRunner {

    beforeTestsJestRegistration(): void;

    registerTestsInJest(describeManager: DescribeManager): void;

    afterTestsJestRegistration(): void;
}
