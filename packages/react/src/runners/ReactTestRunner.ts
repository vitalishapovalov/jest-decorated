import { ReactWrapper } from "enzyme";
import { isArray } from "@js-utilities/typecheck";
import {
    IDescribeRunner,
    ITestRunner,
    PreProcessorData,
    PreProcessor,
    TestEntity,
    ITestsService
} from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export class ReactTestRunner implements ITestRunner {

    private static readonly REACT_DATA_PROVIDER = Symbol();

    public constructor(private readonly defaultTestsRunner: ITestRunner) {}

    public beforeTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.beforeTestsJestRegistration(describeRunner);
    }

    public registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.registerComponentDataProvider(describeRunner, parentDescribeRunner);
        this.defaultTestsRunner.registerTestsInJest(describeRunner, parentDescribeRunner);
    }

    public afterTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.afterTestsJestRegistration(describeRunner, parentDescribeRunner);
    }

    private registerComponentDataProvider(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        const reactExtension = ReactExtension.getReactExtension(describeRunner.getClass());
        const testsService = describeRunner.getTestsService();

        // resolve component provider
        if (!reactExtension.getComponentService().isComponentProviderRegistered()) {
            if (parentDescribeRunner) {
                const parentReactExtension = ReactExtension
                    .getReactExtension(parentDescribeRunner.getClass());
                // parent has component provider, use it
                if (parentReactExtension.getComponentService().isComponentProviderRegistered()) {
                    reactExtension.getComponentService().registerComponentProvider(
                        parentReactExtension.getComponentService().componentProvider.name,
                        parentReactExtension.getComponentService().componentProvider.source
                    );
                }
            } else {
                // no component provider at all
                return;
            }
        }

        testsService.registerPreProcessor(this.registerWithStatePreprocessor(describeRunner));

        // update existing data providers, add react component
        // if parent exists, and it's parent's runner is ReactTestRunner
        // then component provider already been registered
        const componentDataProviderFn = this.createComponentDataProviderFn(describeRunner);
        if (
            !parentDescribeRunner
            || !(parentDescribeRunner.getTestRunner() instanceof ReactTestRunner)
        ) {
            for (const providerName of testsService.getDataProviders()) {
                const providerData = testsService.getDataProvider(providerName);
                const [data] = componentDataProviderFn(
                    providerData,
                    isArray(providerData) && isArray(providerData[0])
                );
                testsService.registerDataProvider(providerName, data);
            }
        }

        // register new data providers
        testsService.registerDataProvider(
            ReactTestRunner.REACT_DATA_PROVIDER,
            componentDataProviderFn(undefined)
        );
        for (const testEntity of testsService.getTests()) {
            this.registerComponentProviderOnTestEntity(
                testEntity,
                reactExtension,
                testsService,
                componentDataProviderFn
            );
        }
    }

    private registerComponentProviderOnTestEntity(
        testEntity: TestEntity,
        reactExtension: ReactExtension,
        testsService: ITestsService,
        componentDataProviderFn: (arg: object | object[], flatProps?: boolean) => any[][]
    ): void {
        const propsDataProvider = reactExtension.getWithProps(testEntity.name as string);
        const hasDataProviders = Boolean(testEntity.dataProviders.length);
        if (hasDataProviders) {
            // if entity has data providers, means that @WithDataProvider already been declared
            // currently, only @WithDataProvider or @WithProps is supported
            if (propsDataProvider) {
                throw new SyntaxError("Currently, only @WithDataProvider or @WithProps is supported per test at one time");
            }
            return;
        }
        if (!propsDataProvider) {
            testEntity.registerDataProvider(ReactTestRunner.REACT_DATA_PROVIDER);
        } else {
            const dataProviderName = Symbol();
            testsService.registerDataProvider(dataProviderName, componentDataProviderFn(propsDataProvider));
            testEntity.registerDataProvider(dataProviderName);
        }
    }

    private createComponentDataProviderFn(
        describeRunner: IDescribeRunner
    ): (arg: object | object[], flatProps?: boolean) => any[][] {
        const reactExtension = ReactExtension.getReactExtension(describeRunner.getClass());
        const clazzInstance = describeRunner.getClassInstance();
        const componentService = reactExtension.getComponentService();
        const componentProvider = componentService.getComponentProvider();

        const componentPromiseFn = (props: object = {}) => new Promise(resolve =>
            componentService
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

    private registerWithStatePreprocessor(describeRunner: IDescribeRunner): PreProcessor {
        const reactExtension = ReactExtension.getReactExtension(describeRunner.getClass());
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
