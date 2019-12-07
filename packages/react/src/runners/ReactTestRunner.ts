import { isArray } from "@js-utilities/typecheck";
import { IDescribeRunner, ITestRunner, IReactExtension } from "@jest-decorated/shared";

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

        const propsAndStateService = reactExtension.getPropsAndStateService();
        testsService.registerPreProcessor(propsAndStateService.createComponentWithPropsPreProcessor(
            describeRunner.getClassInstance(),
            componentDataProviderFn
        ));
        testsService.registerPreProcessor(propsAndStateService.createWithStatePreProcessor(
            describeRunner.getDescribeName()
        ));
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
