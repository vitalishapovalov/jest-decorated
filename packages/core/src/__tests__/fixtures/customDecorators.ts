import { CustomDecoratorCallbackMetadata } from "@jest-decorated/shared";

import { DescribeRunner } from "../../runners";

export const RunOnPlatform = DescribeRunner.createCustomDecorator<[platform: NodeJS.Platform]>({
    beforeTestsRegistration({ args: [platform], describeRunner, methodName }: CustomDecoratorCallbackMetadata<[platform: NodeJS.Platform]>) {
        const isUsedAsClassDecorator = !methodName;
        const isWrongPlatform = process.platform !== platform;
        for (const registeredTest of describeRunner.getTestsService().getTests()) {
            // when used as a ClassDecorator - we want to skip all of the tests, in case of non-matching platform
            // when used as a MethodDecorator - we want to skip only matched tests, in case of non-matching platform
            const isMatchedTest = registeredTest.name === methodName;
            if ((isUsedAsClassDecorator || isMatchedTest) && isWrongPlatform) {
                registeredTest.setTestType("skip");
            }
        }
        if (isUsedAsClassDecorator) {
            // we also want to remove all of the hooks, if used as a class decorator, in case of non-matching platform
            if (isWrongPlatform) {
                describeRunner.getHooksService().hooks.clear();
            }
        } else {
            for (const [hooksFamily, hooksFamilyValuesArray] of describeRunner.getHooksService().hooks) {
                for (const hookFamilyValue of hooksFamilyValuesArray) {
                    // we also want to remove specific hooks, if used as a method decorator, in case of non-matching platform
                    const isMatchedHook = hookFamilyValue === methodName;
                    if (isMatchedHook && isWrongPlatform) {
                        describeRunner.getHooksService().hooks.set(
                            hooksFamily,
                            hooksFamilyValuesArray.filter((val: PropertyKey | (() => any)) => val !== hookFamilyValue)
                        );
                    }
                }
            }
        }
    }
});
