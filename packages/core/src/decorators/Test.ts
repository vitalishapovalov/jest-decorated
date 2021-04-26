import { isUndefined, isNumber } from "@js-utilities/typecheck";
import { Class, ExtendedTest, TestDecorator, TestEntity, TestType } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

/* tslint:disable-next-line:variable-name */
export const Test: ExtendedTest = createTest(TestType.DEFAULT) as ExtendedTest;

/* tslint:disable-next-line:variable-name */
export const It: ExtendedTest = createTest(TestType.DEFAULT) as ExtendedTest;

Test.only = createTest(TestType.ONLY);

Test.skip = createTest(TestType.SKIP);

Test.todo = createTest(TestType.TODO);

It.only = Test.only;

It.skip = Test.skip;

It.todo = Test.todo;

function createTest(testType: TestType): TestDecorator {
    return (testNameOrTimeout, timeout) => {
        return function TestDecoratorFn(proto, methodName) {
            const describeRunner = DescribeRunner.getDescribeRunner(proto.constructor as Class);
            const resolvedTestDescription: string | ((...args: unknown[]) => string) =
                isUndefined(testNameOrTimeout) || isNumber(testNameOrTimeout)
                    ? String(methodName)
                    : testNameOrTimeout;
            const resolvedTimeout = isNumber(testNameOrTimeout)
                ? testNameOrTimeout
                : timeout;

            const testEntity = new TestEntity(methodName, resolvedTestDescription, resolvedTimeout);
            testEntity.setTestType(testType);

            describeRunner
                .getTestsService()
                .registerTest(testEntity);
        };
    };
}
