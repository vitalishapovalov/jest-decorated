import type { IDescribeRunner, ITestRunner, IReactExtension } from "@jest-decorated/shared";

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

    public registerMocks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.registerMocks(describeRunner, parentDescribeRunner);
    }

    public registerAutoCleared(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.registerAutoCleared(describeRunner, parentDescribeRunner);
    }

    public registerLazyModules(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.registerLazyModules(describeRunner, parentDescribeRunner);
    }

    public registerMockFnsAndSpies(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.registerMockFnsAndSpies(describeRunner, parentDescribeRunner);
    }

    public registerHooks(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        this.defaultTestsRunner.registerHooks(describeRunner, parentDescribeRunner);
    }

    public registerTestsInJest(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        ReactTestRunner.createComponentContainers(parentDescribeRunner);
        ReactTestRunner.createComponentContainers(describeRunner);
        this.registerComponentPreProcessors(describeRunner, parentDescribeRunner);
        ReactTestRunner
            .getReactExtension(describeRunner)
            .getComponentService()
            .createActWrappers(describeRunner.getClassInstance());
        this.defaultTestsRunner.registerTestsInJest(describeRunner, parentDescribeRunner);
    }

    private registerComponentPreProcessors(
        describeRunner: IDescribeRunner,
        parentDescribeRunner?: IDescribeRunner
    ): void {
        const reactExtension = ReactTestRunner.getReactExtension(describeRunner);
        const parentReactExtension = ReactExtension.getReactExtension(parentDescribeRunner?.getClass(), false);
        const testsService = describeRunner.getTestsService();
        const componentService = reactExtension.getComponentService();
        const propsAndStateService = reactExtension.getPropsAndStateService();
        const contextService = reactExtension.getContextService();

        // no component provider
        if (!componentService.isComponentProviderRegistered() && !parentReactExtension) {
            return;
        }

        // inherit component provider, act wrappers, default props
        componentService.inheritComponentProviderWithDefaultProps(parentReactExtension);

        // provide component, props
        testsService.registerPreProcessor(
            propsAndStateService.createComponentWithPropsPreProcessor(describeRunner),
            2
        );

        // provide state
        testsService.registerPreProcessor(
            propsAndStateService.createWithStatePreProcessor(describeRunner.getDescribeName()),
            3
        );

        // provide context
        contextService.inheritDefaultContext(parentReactExtension);
        contextService.registerContextProcessor(testsService);
    }
}
