import { ReactWrapper } from "enzyme";
import { isArray } from "@js-utilities/typecheck";
import { IDescribeManager, ITestRunner, PreProcessorData, PreProcessor } from "@jest-decorated/shared";

import ReactExtension from "./ReactExtension";

export default class ReactTestRunner implements ITestRunner {

    private static readonly REACT_DATA_PROVIDER = Symbol();

    public constructor(private readonly defaultTestsRunner: ITestRunner) {}

    public beforeTestsJestRegistration(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void {
        this.defaultTestsRunner.beforeTestsJestRegistration(describeManager);
    }

    public registerTestsInJest(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void {
        this.registerComponentDataProvider(describeManager, parentDescribeManager);
        this.defaultTestsRunner.registerTestsInJest(describeManager, parentDescribeManager);
    }

    public afterTestsJestRegistration(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void {
        this.defaultTestsRunner.afterTestsJestRegistration(describeManager, parentDescribeManager);
    }

    private registerComponentDataProvider(
        describeManager: IDescribeManager,
        parentDescribeManager?: IDescribeManager
    ): void {
        const reactExtension = ReactExtension.getReactExtension(describeManager.getClass());
        const testsManager = describeManager.getTestsManager();

        // resolve component provider
        if (!reactExtension.getComponentManager().isComponentProviderRegistered()) {
            if (parentDescribeManager) {
                const parentReactExtension = ReactExtension
                    .getReactExtension(parentDescribeManager.getClass());
                // parent has component provider
                if (parentReactExtension.getComponentManager().isComponentProviderRegistered()) {
                    reactExtension.getComponentManager().registerComponentProvider(
                        parentReactExtension.getComponentManager().componentProvider.name,
                        parentReactExtension.getComponentManager().componentProvider.source
                    );
                }
            } else {
                // no data provider at all
                return;
            }
        }

        testsManager.registerPreProcessor(this.registerWithStatePreprocessor(describeManager));

        // update existing data providers, add react component
        const dataProviderFn = this.createDataProviderFn(describeManager);
        for (const providerName of testsManager.getDataProviders()) {
            const providerData = testsManager.getDataProvider(providerName);
            const [data] = dataProviderFn(providerData, isArray(providerData) && isArray(providerData[0]));
            testsManager.registerDataProvider(providerName, data);
        }

        // register new data providers
        testsManager.registerDataProvider(
            ReactTestRunner.REACT_DATA_PROVIDER,
            dataProviderFn(undefined)
        );
        for (const testEntity of testsManager.getTests()) {
            const propsDataProvider = reactExtension.getWithProps(testEntity.name as string);
            const hasDataProviders = Boolean(testEntity.dataProviders.length);
            if (hasDataProviders) {
                // if entity has data providers, means that @WithDataProvider already been declared
                // currently, only @WithDataProvider or @WithProps is supported
                if (propsDataProvider) {
                    throw new SyntaxError("Currently, only @WithDataProvider or @WithProps is supported per test at one time");
                }
                continue;
            }
            if (!propsDataProvider) {
                testEntity.registerDataProvider(ReactTestRunner.REACT_DATA_PROVIDER);
            } else {
                const dataProviderName = Symbol();
                testsManager.registerDataProvider(dataProviderName, dataProviderFn(propsDataProvider));
                testEntity.registerDataProvider(dataProviderName);
            }
        }
    }

    private createDataProviderFn(
        describeManager: IDescribeManager
    ): (arg: object | object[], flatProps?: boolean) => any[][] {
        const reactExtension = ReactExtension.getReactExtension(describeManager.getClass());
        const clazzInstance = describeManager.getClassInstance();
        const componentManager = reactExtension.getComponentManager();
        const componentProvider = componentManager.getComponentProvider();

        const componentPromiseFn = (props: object = {}) => new Promise(resolve =>
            componentManager
                .importOrGetComponent()
                .then(importedComponent => resolve(clazzInstance[componentProvider.name]
                    .call(clazzInstance, importedComponent, props))));

        return (dataProvider: object | object[], flatProps?: boolean) => Boolean(componentProvider.source)
            ? [isArray(dataProvider)
                ? dataProvider.map(dataProviderEntry => [
                    componentPromiseFn(dataProviderEntry),
                    ...(isArray(dataProviderEntry) && flatProps ? dataProviderEntry : [dataProviderEntry])])
                : [componentPromiseFn(dataProvider), dataProvider]]
            : [isArray(dataProvider) ? dataProvider : [dataProvider]];
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
