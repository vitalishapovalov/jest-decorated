import { ReactWrapper } from "enzyme";
import { isArray, isCallable, isUndefined } from "@js-utilities/typecheck";
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
        this.registerComponentPreProcessors(describeRunner, parentDescribeRunner);
        ReactTestRunner
            .getReactExtension(describeRunner)
            .getComponentService()
            .createActWrappers(describeRunner.getClassInstance());
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
        const parentReactExtension = ReactExtension.getReactExtension(parentDescribeRunner?.getClass(), false);
        const testsService = describeRunner.getTestsService();
        const componentService = reactExtension.getComponentService();
        const hasComponentProvider = componentService.isComponentProviderRegistered();

        // no component provider
        if (!hasComponentProvider && !parentReactExtension) {
            return;
        }

        // inherit component provider, act wrappers, default props
        if (!hasComponentProvider && parentReactExtension) {
            componentService.inheritComponentProviderWithDefaultProps(reactExtension, parentReactExtension);
        }

        const componentDataProviderFn = this.createComponentDataProviderFn(describeRunner);

        // update existing data providers, add react component
        // if parent's runner is ReactTestRunner
        // then react component already been registered
        if (
            testsService.getDataProviders().length
            && !(parentDescribeRunner?.getTestRunner() instanceof ReactTestRunner)
        ) {
            componentService.addComponentToDataProviders(
                reactExtension,
                describeRunner,
                props => componentDataProviderFn(props).then(([comp]) => comp)
            );
        }

        testsService.registerPreProcessor(this.createComponentProviderPreProcessor(
            describeRunner,
            componentDataProviderFn
        ));
        testsService.registerPreProcessor(this.createWithStatePreProcessor(describeRunner));
    }

    private createComponentProviderPreProcessor(
        describeRunner: IDescribeRunner,
        componentDataProviderFn: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => ({
            ...data,
            args: await this.getArgsArrayWithReactDataProviders(
                data.args,
                data.testEntity,
                describeRunner,
                componentDataProviderFn
            ),
        });
    }

    private createWithStatePreProcessor(describeRunner: IDescribeRunner): PreProcessor {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const stateDataProvider = reactExtension.getWithState(data.testEntity.name as string);
            let wrapper: ReactWrapper;
            if (stateDataProvider && !isUndefined(data.args[0])) {
                if (!data.args[0] || !isCallable((data.args[0] as ReactWrapper).setState)) {
                    console.error(
                        "@WithState() is failed to run for test entity with name"
                        + " "
                        + `"${String(data.testEntity.name)}".`
                        + " "
                        + "in @Describe() suite"
                        + " "
                        + `"${describeRunner.getDescribeName()}".`
                        + "\n"
                        + "Reason: component returned from @ComponentProvider() doesn't have"
                        + " "
                        + `"setState" method.`
                        + "\n"
                        + "Advice: check @ComponentProvider() method and it's return value."
                        + " "
                        + `Also, make sure that your @ComponentProvider() returns component wrapped in Enzyme's "shallow" or "mount".`
                    );
                    return data;
                }
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
        args: unknown[],
        testEntity: TestEntity,
        describeRunner: IDescribeRunner,
        componentDataProviderFn: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): Promise<unknown[]> {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
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
        const defaultProps = reactExtension
            .getComponentService()
            .createAndGetDefaultProps(describeRunner.getClassInstance());
        return propsDataProvider
            ? await componentDataProviderFn(propsDataProvider, defaultProps)
            : await componentDataProviderFn(defaultProps);
    }

    private createComponentDataProviderFn(
        describeRunner: IDescribeRunner
    ): (arg: object | object[], defaultProps?: object) => Promise<any[]> {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        const componentService = reactExtension.getComponentService();
        const componentProvider = componentService.getComponentProvider();
        const componentPromiseFn = this.createComponentPromiseFn(describeRunner);

        return async (dataProvider: object | object[], defaultProps: object): Promise<unknown[]> => {
            const enrichedDataProvider = defaultProps
                ? componentService.enrichWithDefaultProps(defaultProps, dataProvider, true)
                : dataProvider;
            // if there is no component source to import - just pass dataProvider
            if (!Boolean(componentProvider.source)) {
                return isArray(enrichedDataProvider)
                    ? enrichedDataProvider
                    : [enrichedDataProvider];
            }
            // otherwise - pass dataProvider among with imported component
            if (!isArray(enrichedDataProvider)) {
                return [await componentPromiseFn(enrichedDataProvider), enrichedDataProvider];
            }
            // or, if data provider is array - enrich each entry with component
            return await Promise.all(enrichedDataProvider.map(async (dataProviderEntry) => {
                const enrichedDataProviderEntry = defaultProps
                    ? componentService.enrichWithDefaultProps(defaultProps, dataProviderEntry, true)
                    : dataProviderEntry;
                return [
                    await componentPromiseFn(enrichedDataProviderEntry),
                    ...isArray(enrichedDataProviderEntry)
                        ? enrichedDataProviderEntry
                        : [enrichedDataProviderEntry],
                ];
            }));
        };
    }

    private createComponentPromiseFn(
        describeRunner: IDescribeRunner
    ): (props: object) => Promise<unknown> {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        const componentService = reactExtension.getComponentService();
        const componentProvider = componentService.getComponentProvider();
        const clazzInstance = describeRunner.getClassInstance();

        const callProviderMethodAct = async (component: unknown, props: object) => {
            const comp = async () => await clazzInstance[componentProvider.name]
                .apply(clazzInstance, [component, ...isArray(props) ? props : [props]]);
            if (componentProvider.isAct) {
                return await componentService.runWithAct(comp, [], componentProvider.isAsyncAct);
            }
            return await comp();
        };

        return (props: object = {}) => new Promise((resolve, reject) =>
            componentService
                .importOrGetComponent()
                .then(importedComponent =>
                    callProviderMethodAct(importedComponent, props)
                        .then(resolve))
                .catch((error) => {
                    error.message =
                        "Error during evaluating @ComponentProvider()"
                        + " "
                        + "for @Describe() with name"
                        + " "
                        + `"${describeRunner.getDescribeName()}"`
                        + " "
                        + "and @ComponentProvider() method"
                        + " "
                        + `"${componentProvider.name}".`
                        + "\n"
                        + "Advice: check @ComponentProvider() method and props passed to the component."
                        + "\n"
                        + "Error:"
                        + " "
                        + `${error.message}`;
                    reject(error);
                }));
    }
}
