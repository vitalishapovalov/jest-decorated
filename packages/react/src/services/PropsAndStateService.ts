import { ReactWrapper } from "enzyme";
import { isCallable, isUndefined } from "@js-utilities/typecheck";
import {
    IComponentService,
    IDescribeRunner,
    IPropsAndStateService,
    PreProcessor,
    PreProcessorData,
} from "@jest-decorated/shared";

export class PropsAndStateService implements IPropsAndStateService {

    private readonly withStateRegistry: Map<string, object> = new Map();

    private readonly withPropsRegistry: Map<string, object> = new Map();

    public constructor(private readonly componentService: IComponentService) {}

    public registerWithProps(methodName: string, data: object): void {
        this.withPropsRegistry.set(methodName, data);
    }

    public getWithProps(methodName: string): object {
        return this.withPropsRegistry.get(methodName);
    }

    public registerWithState(methodName: string, data: object): void {
        this.withStateRegistry.set(methodName, data);
    }

    public getWithState(methodName: string): object {
        return this.withStateRegistry.get(methodName);
    }

    public createComponentWithPropsPreProcessor(describeRunner: IDescribeRunner): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const propsDataProvider = this.getWithProps(data.testEntity.name as string);
            const defaultProps = this.componentService.createAndGetDefaultProps(describeRunner.getClassInstance());

            const componentWithProps = propsDataProvider
                ? await this.getComponentProviderResultAndProps(describeRunner, propsDataProvider, defaultProps)
                : await this.getComponentProviderResultAndProps(describeRunner, defaultProps);

            return {
                ...data,
                args: [...componentWithProps, ...data.args],
            };
        };
    }

    public createWithStatePreProcessor(describeName: string): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const stateDataProvider = this.getWithState(data.testEntity.name as string);
            if (stateDataProvider && !isUndefined(data.args[0])) {
                if (!data.args[0] || !isCallable((data.args[0] as ReactWrapper).setState)) {
                    console.error(
                        "@WithState() is failed to run for test entity with name"
                        + " "
                        + `"${String(data.testEntity.name)}".`
                        + " "
                        + "in @Describe() suite"
                        + " "
                        + `"${describeName}".`
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
                let wrapper: ReactWrapper;
                await new Promise((resolve) => {
                    wrapper = (data.args[0] as ReactWrapper).setState(stateDataProvider, resolve);
                });
                // we're sure that args are array here, because of props pre-processor
                const [_, ...restArgs] = data.args as unknown[];
                return {
                    ...data,
                    args: [wrapper || data.args[0], ...restArgs, stateDataProvider],
                };
            }
            return data;
        };
    }

    private async getComponentProviderResultAndProps(
        describe: IDescribeRunner,
        props: object | object[],
        defaultProps?: object
    ): Promise<[unknown, object]> {
        const componentProvider = this.componentService.getComponentProvider();
        const clazzInstance = describe.getClassInstance();
        // enrich with default props, if possible
        const enrichedProps = defaultProps ? { ...defaultProps, ...props } : props;
        try {
            // import component if needed, pass it to @ComponentProvider args
            const componentProviderArgs = componentProvider.source
                ? [await this.componentService.importOrGetComponent(), enrichedProps]
                : [enrichedProps];
            // handle @Act decorators on @ComponentProvider
            const componentProviderResultFn = async () => await clazzInstance[componentProvider.name]
                .apply(clazzInstance, componentProviderArgs);
            const componentProviderResult = componentProvider.isAct
                ? await this.componentService.runWithAct(componentProviderResultFn, [], componentProvider.isAsyncAct)
                : await componentProviderResultFn();
            // this will be passed to each test as arguments
            return [componentProviderResult, enrichedProps];
        } catch (error) {
            throw new Error("Error during evaluating @ComponentProvider()"
                + " "
                + "for @Describe() with name"
                + " "
                + `"${describe.getDescribeName()}"`
                + " "
                + "and @ComponentProvider() method"
                + " "
                + `"${componentProvider.name}".`
                + "\n"
                + "Advice: check @ComponentProvider() method and props passed to the component."
                + "\n"
                + "Error:"
                + " "
                + `${error.message}`);
        }
    }
}
