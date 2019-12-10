import { isUndefined, isNumber } from "@js-utilities/typecheck";
import { Class, TestEntity, TestType } from "@jest-decorated/shared";

import { DescribeRunner } from "../runners";

/* tslint:disable-next-line:variable-name */
export const Test: ExtendedTest = createTest(TestType.DEFAULT);

/* tslint:disable-next-line:variable-name */
export const It: ExtendedTest = createTest(TestType.DEFAULT);

Test.Only = createTest(TestType.ONLY);

Test.Skip = createTest(TestType.SKIP);

Test.Todo = createTest(TestType.TODO);

It.Only = Test.Only;

It.Skip = Test.Skip;

It.Todo = Test.Todo;

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

type TestDecorator = ((testNameOrTimeout?: string | ((...args: unknown[]) => string) | number, timeout?: number) =>
    (proto: object, methodName: PropertyKey) => void);

type ExtendedTest = TestDecorator & {
    Only?: TestDecorator;
    Skip?: TestDecorator;
    Todo?: TestDecorator;
};
