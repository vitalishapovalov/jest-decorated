import { ReactWrapper } from "enzyme";
import { isArray } from "@js-utilities/typecheck";
import {
    IDescribeManager,
    ITestRunner,
    ITestsManager,
    TestEntity,
    PreProcessorData,
    PreProcessor,
} from "@jest-decorated/shared";

import ReactExtension from "./ReactExtension";

export default class ReactTestRunner implements ITestRunner {

    private static readonly REACT_DATA_PROVIDER = Symbol();

    public constructor(private readonly defaultTestsRunner: ITestRunner) {}

    public beforeTestsJestRegistration(describeManager: IDescribeManager): void {
        this.defaultTestsRunner.beforeTestsJestRegistration(describeManager);
    }

    public registerTestsInJest(describeManager: IDescribeManager): void {
        this.registerComponentDataProvider(describeManager);
        this.defaultTestsRunner.registerTestsInJest(describeManager);
    }

    public afterTestsJestRegistration(describeManager: IDescribeManager): void {
        this.defaultTestsRunner.afterTestsJestRegistration(describeManager);
    }

    private registerComponentDataProvider(describeManager: IDescribeManager): void {
        const reactExtension = ReactExtension.getReactExtension(describeManager.getClass());
        const testsManager = describeManager.getTestsManager();

        if (!reactExtension.getComponentManager().isComponentProviderRegistered()) return;

        const dataProviderFn = this.createDataProviderFn(describeManager);

        testsManager.registerDataProvider(ReactTestRunner.REACT_DATA_PROVIDER, dataProviderFn(undefined));

        testsManager.registerPreProcessor(this.registerWithStatePreprocessor(describeManager));

        for (const testEntity of testsManager.getTests()) {
            const propsDataProvider = reactExtension.getWithProps(testEntity.name as string);
            if (!propsDataProvider) {
                testEntity.registerDataProvider(ReactTestRunner.REACT_DATA_PROVIDER);
            } else {
                this.registerDataProvider(propsDataProvider, testEntity, testsManager, dataProviderFn);
            }
        }
    }

    private createDataProviderFn(describeManager: IDescribeManager): (arg: object | object[]) => any[][] {
        const reactExtension = ReactExtension.getReactExtension(describeManager.getClass());
        const clazzInstance = describeManager.getClassInstance();
        const componentManager = reactExtension.getComponentManager();
        const componentProvider = componentManager.getComponentProvider();

        const createComponentPromise = (props: object = {}) => new Promise(resolve =>
            componentManager
                .importOrGetComponent()
                .then(importedComponent => resolve(clazzInstance[componentProvider.name]
                    .call(clazzInstance, importedComponent, props))));

        return (dataProvider: object | object[]) => Boolean(componentProvider.source)
            ? [isArray(dataProvider)
                ? dataProvider.map(dataProviderEntry =>
                    [createComponentPromise(dataProviderEntry), dataProviderEntry])
                : [createComponentPromise(dataProvider), dataProvider]]
            : [isArray(dataProvider) ? dataProvider : [dataProvider]];
    }

    private registerDataProvider(
        dataProvider: object | object[],
        testEntity: TestEntity,
        testsManager: ITestsManager,
        dataProviderFn: (...args: any[]) => any[][],
        dataProviderName: string | symbol = Symbol()
    ): void {
        testsManager.registerDataProvider(dataProviderName, dataProviderFn(dataProvider));
        testEntity.registerDataProvider(dataProviderName);
    }

    private registerWithStatePreprocessor(describeManager: IDescribeManager): PreProcessor {
        const reactExtension = ReactExtension.getReactExtension(describeManager.getClass());
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const stateDataProvider = reactExtension.getWithState(data.testEntity.name as string);
            let wrapper: ReactWrapper;
            if (stateDataProvider && data.args[0]) {
                await new Promise((resolve) => {
                    wrapper = (data.args[0] as ReactWrapper).setState(stateDataProvider, resolve);
                });
                const [_, ...restArgs] = data.args;
                return { ...data, args: [wrapper || data.args[0], stateDataProvider, ...restArgs] };
            }
            return data;
        };
    }
}
