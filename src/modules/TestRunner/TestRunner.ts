import { isCallable } from "@js-utilities/typecheck";

import ITestRunner from "./ITestRunner";
import DescribeManager from "../DescribeManager";
import Test from "../Test";

export default class TestRunner implements ITestRunner {

    public static resolveDescription(
        description: string | ((...args: any[]) => string),
        args: any[] = [],
        providerName?: PropertyKey
    ): string {
        return isCallable(description)
            ? description.apply(null, [providerName, ...args])
            : description;
    }

    public beforeTestsJestRegistration(describeManager: DescribeManager): void {
    }

    public registerTestsInJest(describeManager: DescribeManager): void {
        for (const testEntity of describeManager.getTestsManager().getTests()) {
            this.registerTestInJest(testEntity, describeManager);
        }
    }

    public afterTestsJestRegistration(describeManager: DescribeManager): void {
    }

    protected registerTestInJest(testEntity: Test, describeManager: DescribeManager): void {
        const clazzInstance = describeManager.getClassInstance();
        const registerTest = (args: any[] = [], providerName?: PropertyKey) => test(
            TestRunner.resolveDescription(testEntity.description, args, providerName),
            async () => await clazzInstance[testEntity.name].apply(clazzInstance, args)
        );
        if (!testEntity.dataProviders.length) {
            registerTest();
        } else {
            this.registerDataProvidersTest(testEntity, describeManager, registerTest);
        }
    }

    protected registerDataProvidersTest(
        testEntity: Test,
        describeManager: DescribeManager,
        registerFn: (args: any[], providerName?: PropertyKey) => any
    ) {
        const testsManager = describeManager.getTestsManager();
        const dataProvidersData = testEntity.dataProviders
            .map<any[][]>(testsManager.getDataProvider.bind(testsManager));
        testEntity.dataProviders
            .reduce<Map<PropertyKey, any[][]>>(
                (map, name, i) => {
                    dataProvidersData[i].forEach((args) => {
                        const currArgs = map.get(name) || [];
                        currArgs.push(args);
                        map.set(name, currArgs);
                    });
                    return map;
                },
                new Map()
            )
            .forEach(
                (argsArr, name) => argsArr.forEach(args => registerFn(args, name))
            );
    }
}
