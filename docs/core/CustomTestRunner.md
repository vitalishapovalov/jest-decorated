# Custom Test Runner

`jest-decorated` provides an ability to change/extend its functionality with custom `Test Runners`.

You can do this by writing your own `Test Runner` and using it among with [@RunWith](core/RunWith.md) decorator.

## Writing your own Test Runner

So, let's start. First thing you need to know - your Test Runner class must implement the `ITestRunner` interface, or extend the `TestRunner` class.

- `TestRunner` class: the class can be found in the `@jest-decorated/core` package. This is the preferred option and will be used in further examples. The initial implementation, which does nothing, and simply executes the default methods of the runner:

```javascript
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {}
```

- `ITestRunner` interface: the interface can be found in the `@jest-decorated/shared` package, which comes by default with any `jest-decorated` package.
Wrong implementation could lead to unexpected behaviour, only use this when you need to disable the default behaviour of runner. The initial implementation, which does nothing, and simply executes the default methods of the runner:

```javascript
import type { IDescribeRunner, ITestRunner } from "@jest-decorated/shared";

// all of the TestRunner's methods will be executed inside the describe() callback function
export class MyTestRunner implements ITestRunner {

    public constructor(protected readonly defaultTestsRunner: ITestRunner) {
    }

    public registerMocks(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerMocks(describeRunner, parentDescribeRunner);
    }

    public registerAutoCleared(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerAutoCleared(describeRunner, parentDescribeRunner);
    }

    public registerLazyModules(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerLazyModules(describeRunner, parentDescribeRunner);
    }

    public registerMockFnsAndSpies(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerMockFnsAndSpies(describeRunner, parentDescribeRunner);
    }

    public registerHooks(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerHooks(describeRunner, parentDescribeRunner);
    }

    public registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.defaultTestsRunner.registerTestsInJest(describeRunner, parentDescribeRunner);
    }

}
```

## Adding more functionality to your runner

Now, when we have our own `MyTestRunner`, we can start doing things before/after our test are executed. Also, we can access all metadata of the `jest-decorated` and `jest`.

```javascript
import type { IDescribeRunner } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.beforeTestsInJestRegistration(describeRunner); // this line is executed before tests are passed to jest
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
        this.afterTestsInJestRegistration(describeRunner); // this line is executed after tests are passed to jest, tests will start soon...
    }
    
    private beforeTestsInJestRegistration(): void {
        // you can can get a lot of stuff from the DescribeRunner (https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/shared/src/interfaces/core/runners/IDescribeRunner.ts),
        // but we will only need TestsService (https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/shared/src/interfaces/core/services/ITestsService.ts) here
        const testsService = describeRunner.getTestsService();

        // here we can do anything with our tests:
        // log info about tests, set your own metadata, change anything, etc.
        // TestEntity (https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/shared/src/entities/TestEntity.ts)
        for (const testEntity of testsService.getTests()) {
            // modify test's description
            testEntity.description += " my label";
            // add some custom data to test entity (can be used in Test Processors later)
            testEntity.setMetadata("myKey", { myVal: "foo" });
            // mark test as 'skipped', if you want (https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/shared/src/types/TestType.ts)
            testEntity.setTestType("skip");
        }
    }

    private afterTestsInJestRegistration(): void {
        // do any kind of side-effect here, but you shouldn't try to change test entities
    }
    
}
```

## Working with test processors

Test processors are functions, that applies to each test, in the specified order.

Some functions are applied before the test has started execution (`PreProcessor`). Others - right after the test has finished execution (`PostProcessor`).

Let's implement a simple processors, that will measure the test's execution time (yeah, it's pretty mich useless, but it's a good example to show processors functionality):

```javascript
import type { IDescribeRunner, PreProcessorData } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.beforeTestsInJestRegistration(describeRunner);
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
    }
    
    private registerExecutionTimeProcessors(describeRunner: IDescribeRunner): void {
        const testsService = describeRunner.getTestsService();
        
        testsService.registerPreProcessor(
            // here you can do any side effects, but you shouldn't change any info about the test itself (name, description, type)
            // you can also override this data, by returning the same object
            (preProcessorData: PreProcessorData) => {
                const { testEntity, args, clazzInstance } = preProcessorData;
                testEntity.setMetadata("startTimestamp", Date.now());
                return preProcessorData;
            },
            // order of the callback in the callbacks chain, if it matters
            // we want this to be executed after all others preProcessors (to be as close to test start as possible)
            Number.MAX_SAFE_INTEGER
        );

        testsService.registerPostProcessor(
            // - preProcessorResult is an entity, returned by your preProcessors chain
            // - testError is an error, which could be a result of the test itself,
            //   regardless of the post-processor result, this function error will be thrown (test has failed)
            (preProcessorResult: PreProcessorData, testError?: Error) => {
                const finishTime = Date.now();
                const startTime = preProcessorResult.testEntity.getMetadata<number>("startTimestamp");
                const executionTime = finishTime - startTime;
                console.log(`Test '${preProcessorResult.testEntity.description}' execution time: ${executionTime}ms`);
            },
            // order of the callback in the callbacks chain, if it matters
            // we want this to be executed before all others postProcessors (to be as close to test finish as possible)
            0
        );
    }
    
}
```

## Registering you own global hooks

If we, for example, want to register some global `beforeAll/afterAll` or `beforeEach/afterEach`, we can do it in this way:

```javascript
import type { IDescribeRunner } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";
import rimraf from "rimraf";

export class MyTestRunner extends TestRunner {

    public override registerHooks(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        // let's register a hook, that will be executed before any of the decorator-register hooks
        // we'll log each test name
        beforeEach(() => {
            process.stdout.write(`\nSTARTING NEW TEST: ${expect.getState().currentTestName}\n`);
        });
        super.registerHooks(describeRunner, parentDescribeRunner); // this line is register all of the @BeforeAll/AfterAll/AfterEach/BeforeEach
        // now, let's register a hook, that will be executed after any of the decorator-register hooks
        // we'll cleanup a temp directory created by our tests (let's imagine that we have one)
        afterAll(async () => {
            await new Promise(resolve => rimraf("./someTempDir", resolve));
        });
    }
    
}
```

## Using your own test runner

Now, when we have everything we need in our `MyTestRunner` class, we can start using it:

```javascript
// my-test.spec.ts
import { MyTestRunner } from "./MyTestRunner.ts";

@Describe()
@RunWith(MyTestRunner)
class MyTest {
    // your tests
}
```
