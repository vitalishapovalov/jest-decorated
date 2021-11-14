# Custom Decorators

You're able to register your own `@Decorators` with the public `DescribeRunner.createCustomDecorator()` static method.

Interface:

```javascript
import { CustomDecoratorCallbackMetadata, CustomDecoratorPreProcessorMetadata, CustomDecoratorPostProcessorMetadata } from "@jest-decorated/shared";

class DescribeRunner {
  
  public static createCustomDecorator<Args extends any[] = []>(
    callbacks: {
      // will be executed before the tests, hooks, etc. are registered in jest
      beforeTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
      
      // will be executed when all of tests, hooks, etc. are already registered in jest
      afterTestsRegistration?(metadata: CustomDecoratorCallbackMetadata<Args>): void;
      
      // PreProcessor:
      // - will be executed for each test, if the resulting decorator will be used as a ClassDeorator
      // - will be executed only for the matched test, if the resulting decorator will be used as a MethodDeorator
      preProcessor?(metadata: CustomDecoratorPreProcessorMetadata<Args>): Promise<PreProcessorData> | PreProcessorData | void;
      
      // PostProcessor:
      // - will be executed for each test, if the resulting decorator will be used as a ClassDeorator
      // - will be executed only for the matched test, if the resulting decorator will be used as a MethodDeorator
      postProcessor?(metadata: CustomDecoratorPostProcessorMetadata<Args>): void;
    }
  ): (...args: T) => (target: object | Class, propertyKey?: PropertyKey, propertyDescriptor?: PropertyDescriptor) => any;

}
```

## @RunOnPlatform - run some tests only on specific platforms

Imagine that we want some of our tests to be executed only on `Windows` (win32).
In the future, there could be more environments to come (e.g. `MacOS` (darwin)), so we want our decorator to be generic.

We want to be able to use our decorator on both Test Suites and Tests.

Our decorator will accept only one argument `(platform: NodeJS.Platform)`.

Let's implement it:

```javascript
// RunOnPlatform.ts

import type { IDescribeRunner, CustomDecoratorCallbackMetadata } from "@jest-decorated/shared";
import { DescribeRunner } from "@jest-decorated/core";

export const RunOnPlatform = DescribeRunner.createCustomDecorator<[platform: NodeJS.Platform]>({
    // we want to modify tests before they are registered in jest
    beforeTestsRegistration({ args: [platform], describeRunner, methodName }: CustomDecoratorCallbackMetadata<[platform: NodeJS.Platform]>): void {
        const isUsedAsClassDecorator = !methodName;
        for (const registeredTest of describeRunner.getTestsService().getTests()) {
            // when used as a ClassDecorator - we want to skip all of the tests, in case of non-matching platform
            // when used as a MethodDecorator - we want to skip only matched tests, in case of non-matching platform
            const isMatchedTest = registeredTest.name === methodName;
            const isWrongPlatform = process.platform !== platform;
            if ((isUsedAsClassDecorator || isMatchedTest) && isWrongPlatform) {
                registeredTest.setTestType("skip");
            }
        }
    }
});
```

And now, we can start using it:

```javascript
// my-spec.test.ts

import { RunOnPlatform } from "./RunOnPlatform.ts";

@Describe()
class MySpecUsedAsMethod {
    
    @Test()
    @RunOnPlatform("win32")
    myWindowsSpecificTest() {
        // windows-specific test
    }

    @Test()
    @RunOnPlatform("darwin")
    myMacOSSpecificTest() {
        // mac-specific test
    }
    
}

@Describe()
@RunOnPlatform("win32")
class MySpecUsedAsClass {

  // windows-specific tests

}
```

## @CaptureScreenshot - `jest-playwright` specific, capture screenshot at the end of the test

Imagine that we have `playwright` + `jest-playwright`, and we want to capture the screenshot of the page at the end, for some specific tests only.

Our decorator will accept only one argument `(screenshotNameSuffix: string)`.

Let's implement it:

```javascript
// CaptureScreenshot.ts

import type { CustomDecoratorPostProcessorMetadata } from "@jest-decorated/shared";
import { DescribeRunner } from "@jest-decorated/core";

export const CaptureScreenshot = DescribeRunner.createCustomDecorator<[screenshotNameSuffix: string]>({
    // we'll register a post-processor, to be able to capture all of the TestSuite's test results, or only the selected one
    postProcessor({ testError, testResult, methodName }: CustomDecoratorPostProcessorMetadata<[screenshotNameSuffix: string]>): void {
        // we don't want to capture screenshots of the failed tests
        if (testError) {
            return;
        }
        // when used as a ClassDecorator - we want to capture screenshots for all of the tests
        // when used as a MethodDecorator - we want to capture screenshots only for matched tests
        const isUsedAsClassDecorator = !methodName;
        const isMatchedTest = testResult?.testEntity.name === methodName;
        if (isUsedAsClassDecorator || isMatchedTest) {
            page.screenshot({
                path: `captured_screenshots/${testResult.testEntity.description}-${screenshotNameSuffix}.png`
            });
        }
    }
});
```

And now, we can start using it:

```javascript
// my-spec.test.ts

import { CaptureScreenshot } from "./CaptureScreenshot.ts";

@Describe()
class MySpecUsedAsMethod {

    @Test()
    @CaptureScreenshot("result")
    myUiTest() {
        // test impl
    }
    
}

@Describe()
@CaptureScreenshot("result")
class MySpecUsedAsClass {

  // tests

}
```
