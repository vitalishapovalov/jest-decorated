import { ReactWrapper } from "enzyme";
import { isArray } from "@js-utilities/typecheck";
import {
    IDescribeRunner,
    ITestRunner,
    PreProcessorData,
    PreProcessor,
    TestEntity,
    IReactExtension,
} from "@jest-decorated/shared";

import { ReactExtension } from "../extensions";

export class ReactTestRunner implements ITestRunner {

    private static getReactExtension(describeRunner: IDescribeRunner): IReactExtension {
        return ReactExtension.getReactExtension(describeRunner?.getClass());
    }

    private static createComponentContainers(describeRunner: IDescribeRunner): void {
        ReactTestRunner.getReactExtension(describeRunner)?.getComponentService()
            .createComponentContainers();
    }

    public constructor(private readonly defaultTestsRunner: ITestRunner) {}

    public beforeTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        ReactTestRunner.createComponentContainers(parentDescribeRunner);
        ReactTestRunner.createComponentContainers(describeRunner);
        this.defaultTestsRunner.beforeTestsJestRegistration(describeRunner);
    }

    public registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        ReactTestRunner
            .getReactExtension(describeRunner)
            .getComponentService()
            .createActWrappers(describeRunner.getClassInstance());
        this.registerComponentPreProcessors(describeRunner, parentDescribeRunner);
        this.defaultTestsRunner.registerTestsInJest(describeRunner, parentDescribeRunner);
    }

    public afterTestsJestRegistration(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.afterTestsJestRegistration(describeRunner, parentDescribeRunner);
    }

    private registerComponentPreProcessors(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        const testsService = describeRunner.getTestsService();
        const hasComponentProvider = reactExtension
            .getComponentService()
            .isComponentProviderRegistered();

        // resolve component provider
        if (!hasComponentProvider) {
            if (parentDescribeRunner) {
                const parentReactExtension = ReactExtension
                    .getReactExtension(parentDescribeRunner.getClass());
                // parent has component provider, use it
                if (parentReactExtension.getComponentService().isComponentProviderRegistered()) {
                    reactExtension
                        .getComponentService()
                        .registerComponentProvider(
                            parentReactExtension.getComponentService().componentProvider.name,
                            parentReactExtension.getComponentService().componentProvider.source
                        );
                }
            } else {
                // no component provider at all
                return;
            }
        }

        const componentDataProviderFn = this.createComponentDataProviderFn(describeRunner);

        // update existing data providers, add react component
        // if parent's runner is ReactTestRunner
        // then react component already been registered
        if (
            (
                !parentDescribeRunner
                || !(parentDescribeRunner.getTestRunner() instanceof ReactTestRunner)
            )
            && testsService.getDataProviders().length
        ) {
            const componentPromise = componentDataProviderFn(undefined)
                .then(([comp]) => comp);
            for (const providerName of testsService.getDataProviders()) {
                const providerDataWithReactComponent = [];
                const providerData = testsService.getDataProvider(providerName);
                for (const providerDataUnit of providerData) {
                    providerDataWithReactComponent.push(isArray(providerDataUnit)
                        ? [componentPromise, ...providerDataUnit]
                        : [componentPromise, providerDataUnit]
                    );
                }
                testsService.registerDataProvider(providerName, providerDataWithReactComponent);
            }
        }

        testsService.registerPreProcessor(this.registerComponentProviderPreprocessor(
            describeRunner,
            componentDataProviderFn
        ));

        testsService.registerPreProcessor(this.registerWithStatePreprocessor(describeRunner));
    }

    private registerComponentProviderPreprocessor(
        describeRunner: IDescribeRunner,
        componentDataProviderFn: (arg: object | object[]) => Promise<any[]>
    ): PreProcessor {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);

        return async (data: PreProcessorData): Promise<PreProcessorData> => ({
            ...data,
            args: await this.getArgsArrayWithReactDataProviders(
                data.args,
                data.testEntity,
                reactExtension,
                componentDataProviderFn
            ),
        });
    }

    private registerWithStatePreprocessor(describeRunner: IDescribeRunner): PreProcessor {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
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

    private async getArgsArrayWithReactDataProviders(
        args: any[],
        testEntity: TestEntity,
        reactExtension: IReactExtension,
        componentDataProviderFn: (arg: object | object[], flatProps?: boolean) => Promise<any[]>
    ): Promise<any[]> {
        const propsDataProvider = reactExtension.getWithProps(testEntity.name as string);
        const hasDataProviders = Boolean(testEntity.dataProviders.length);
        if (hasDataProviders) {
            // if entity has data providers, means that @WithDataProvider already been declared
            // currently, only @WithDataProvider or @WithProps is supported
            if (propsDataProvider) {
                throw new SyntaxError("Currently, only @WithDataProvider or @WithProps is supported per test at one time");
            }
            return args;
        }
        return propsDataProvider
            ? await componentDataProviderFn(propsDataProvider)
            : await componentDataProviderFn(undefined);
    }

    private createComponentDataProviderFn(
        describeRunner: IDescribeRunner
    ): (arg: object | object[]) => Promise<any[]> {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        const clazzInstance = describeRunner.getClassInstance();
        const componentService = reactExtension.getComponentService();
        const componentProvider = componentService.getComponentProvider();

        const callProviderMethodAct = async (props: object, component: any) => {
            const comp = async () => await clazzInstance[componentProvider.name]
                .call(clazzInstance, component, props);
            if (componentProvider.isAct) {
                return await componentService.runWithAct(comp, [], componentProvider.isAsyncAct);
            }
            return await comp();
        };
        const componentPromiseFn = (props: object = {}) => new Promise(resolve =>
            componentService
                .importOrGetComponent()
                .then(importedComponent =>
                    callProviderMethodAct(props, importedComponent)
                        .then(resolve)));

        return async (dataProvider: object | object[]): Promise<any[]> => {
            if (!Boolean(componentProvider.source)) {
                return isArray(dataProvider)
                    ? dataProvider
                    : [dataProvider];
            }
            return isArray(dataProvider)
                ? await Promise.all(dataProvider.map(async dataProviderEntry => [
                    await componentPromiseFn(dataProviderEntry),
                    ...isArray(dataProviderEntry)
                        ? dataProviderEntry
                        : [dataProviderEntry],
                ]))
                : [await componentPromiseFn(dataProvider), dataProvider];
        };
    }
}
