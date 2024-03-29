# Custom Decorators with Test Runner

When you already have [your own Test Runner](core/CustomTestRunner.md), you can go further and write your own `@Decorators` with it.

## Creating own registry

First, we need to update our Test Runner. We need it ho have a global, class-specific registry, to be able to register our own metadata:

```javascript
import type { Class } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {

    // we'll use the test class as the key in a WeakMap (Weak - because we only want metadata to exist while the test class exists)
    // and a Map as the value (Map will hold our test class-specific data)
    private static readonly GLOBAL_REGISTRY = new WeakMap<Class, Map>();
    
    // we'll use this method in our @Decorators to access/register test class-specific data
    // we'll create a new registry instance on the first invocation
    public static getRegistry(clazz: Class): Map {
        let classSpecificRegistry = MyTestRunner.GLOBAL_REGISTRY.get(clazz);
        if (!classSpecificRegistry) {
            classSpecificRegistry = new Map();
            MyTestRunner.GLOBAL_REGISTRY.set(clazz, classSpecificRegistry);
        }
        return classSpecificRegistry;
    }
}
```

Now, we're ready to start writing our own `@Decorators`.

## @RunOnPlatform - run some tests only on specific platforms

We'll implement the same `@RunOnPlatform` decorator as described [here](core/CustomDecorator.md), with only 1 difference - our decorator will be used only as a MethodDecorator:

```javascript
// RunOnPlatform.ts

import type { Class } from "@jest-decorated/shared";
import { MyTestRunner } from "./MyTestRunner.ts";

export function RunOnPlatform(platform: Platform) {
    return function(target: object, propertyKey: PropertyKey) {
        const myRegistry: Map = MyTestRunner.getRegistry(target.constructor as Class);
        const existingValues = myRegistry.get("RunOnPlatform");
        myRegistry.set("RunOnPlatform", {
            ...existingValues,
            [propertyKey]: platform,
        });
    };
}
```

```javascript
// MyTestRunner.ts

import type { Class } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {

    // registry implementation from the first step here

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.registerRunOnPlatform(describeRunner);
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
    }
    
    private registerRunOnPlatform(describeRunner: IDescribeRunner): void {
        const currentRegistry = MyTestRunner.getRegistry(describeRunner.getClass());
        const runOnPlatformRegisteredTests = currentRegistry.get("RunOnPlatform");
        for (const testEntity of describeRunner.getTestsService().getTests()) {
            const testSupportedPlatform = runOnPlatformRegisteredTests[testEntity.name];
            if (testSupportedPlatform && testSupportedPlatform !== process.platform) {
                testEntity.setTestType("skip");
            }
        }
    }
    
}
```

And now, we can start using it:

```javascript
// my-spec.test.ts

import { MyTestRunner } from "./MyTestRunner.ts";
import { RunOnPlatform } from "./RunOnPlatform.ts";

@Describe()
@RunWith(MyTestRunner)
class MySpec {
    
    @Test()
    @RunOnPlatform("win32")
    myWindowsSpecificTest() {
        // test impl
    }

    @Test()
    @RunOnPlatform("darwin")
    myMacOSSpecificTest() {
        // test impl
    }
    
}
```

## @CaptureScreenshot - `jest-playwright` specific, capture screenshot at the end of the test

We'll implement the same `@RunOnPlatform` decorator as described [here](core/CustomDecorator.md), with 2 differences - our decorator will be used only as a MethodDecorator, and will not accept any arguments:

```javascript
// CaptureScreenshot.ts

import type { Class } from "@jest-decorated/shared";
import { MyTestRunner } from "./MyTestRunner.ts";

export function CaptureScreenshot(target: object, propertyKey: PropertyKey) {
    const myRegistry: Map = MyTestRunner.getRegistry(target.constructor as Class);
    const existingValues = myRegistry.get("CaptureScreenshot");
    myRegistry.set("CaptureScreenshot", [
        ...existingValues,
        propertyKey
    ]);
}
```

```javascript
// MyTestRunner.ts

import type { Class, PreProcessorData } from "@jest-decorated/shared";
import { TestRunner } from "@jest-decorated/core";

export class MyTestRunner extends TestRunner {

    // registry implementation from the first step here

    public override registerTestsInJest(describeRunner: IDescribeRunner, parentDescribeRunner?: IDescribeRunner): void {
        this.registerCaptureScreenshotPostProcessor(describeRunner);
        super.registerTestsInJest(describeRunner, parentDescribeRunner);
    }
    
    private registerCaptureScreenshotPostProcessor(describeRunner: IDescribeRunner): void {
        const currentRegistry = MyTestRunner.getRegistry(describeRunner.getClass());
        const captureScreenshotTests = currentRegistry.get("CaptureScreenshot");

        describeRunner.getTestsService().registerPostProcessor(
            (preProcessorData: PreProcessorData, testError?: Error) => {
                if (testError) {
                    return;
                }
                if (captureScreenshotTests.includes(preProcessorData.testEntity.name)) {
                    page.screenshot({
                        path: `captured_screenshots/${preProcessorData.testEntity.description}.png`
                    });
                }
            },
            0
        );
    }
    
}
```

And now, we can start using it:

```javascript
// my-spec.test.ts

import { MyTestRunner } from "./MyTestRunner.ts";
import { CaptureScreenshot } from "./CaptureScreenshot.ts";

@Describe()
@RunWith(MyTestRunner)
class MySpec {

    @Test()
    @CaptureScreenshot
    myUiTest() {
        // test impl
    }
    
}
```
