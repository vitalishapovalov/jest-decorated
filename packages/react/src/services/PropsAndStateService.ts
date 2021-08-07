import type { ReactWrapper } from "enzyme";
import type {
    IComponentService,
    IDescribeRunner,
    IPropsAndStateService,
    PreProcessor,
    PreProcessorData,
} from "@jest-decorated/shared";
import chalk from "chalk";
import { isCallable, isObject, isString, isUndefined } from "@js-utilities/typecheck";

import { ComponentService } from "./ComponentService";

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
            const defaultProps = this.createAndGetDefaultProps(describeRunner.getClassInstance());

            const [component, props] = propsDataProvider
                ? await this.getComponentProviderResultAndProps(describeRunner, propsDataProvider, defaultProps)
                : await this.getComponentProviderResultAndProps(describeRunner, defaultProps);

            // If context has been registered, object with props and state
            // will be accessible and we just need to update it.
            // Otherwise - create and register object with props and state.
            const hasPropsAndStateObj = data.args.some(arg => arg[ComponentService.STATE_PROPS_CONTEXT_ARG]);
            const mappedArgs = hasPropsAndStateObj
                ? data.args.map(
                    arg => arg[ComponentService.STATE_PROPS_CONTEXT_ARG]
                        ? { ...arg as object, props, [ComponentService.STATE_PROPS_CONTEXT_ARG]: true }
                        : arg
                )
                : data.args;
            return {
                ...data,
                args: [
                    component,
                    ...(hasPropsAndStateObj
                        ? []
                        : [{ props, [ComponentService.STATE_PROPS_CONTEXT_ARG]: true }]),
                    ...mappedArgs,
                ],
            };
        };
    }

    public createWithStatePreProcessor(describeName: string): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const state = this.getWithState(data.testEntity.name as string);
            if (state && !isUndefined(data.args[0])) {
                if (!data.args[0] || !isCallable((data.args[0] as ReactWrapper).setState)) {
                    console.error(
                        "@WithState() is failed to run for test entity with name"
                        + " "
                        + `${chalk.bgWhiteBright.black("\"" + String(data.testEntity.name) + "\"")}.`
                        + " "
                        + "in @Describe() suite"
                        + " "
                        + `${chalk.bgWhiteBright.black("\"" + describeName + "\"")}.`
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
                await new Promise((resolve: (...args: any[]) => any) => {
                    wrapper = (data.args[0] as ReactWrapper).setState(state, resolve);
                });
                // we're sure that args are an array here, because of the props pre-processor
                const [prevComponent, ...restArgs] = data.args as unknown[];
                return {
                    ...data,
                    args: [
                        wrapper || prevComponent,
                        ...restArgs.map(
                            arg => arg[ComponentService.STATE_PROPS_CONTEXT_ARG]
                                ? { ...arg as object, state }
                                : arg
                        ),
                    ],
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
            console.error("Error during evaluating @ComponentProvider()"
                + " "
                + "for @Describe() with name"
                + " "
                + `${chalk.bgWhiteBright.black("\"" + describe.getDescribeName() + "\"")}`
                + " "
                + "and @ComponentProvider() method"
                + " "
                + `${chalk.bgWhiteBright.black("\"" + componentProvider.name + "\"")}.`
                + "\n"
                + "Advice: check @ComponentProvider() method and props passed to the component."
                + "\n"
                + "Error message:"
                + " "
                + `${error.message}`);
            throw error;
        }
    }

    private createAndGetDefaultProps(
        clazzInstance: object,
        defaultProps: unknown = this.componentService.componentProvider.defaultProps
    ): object {
        if (!defaultProps) {
            return {};
        }
        if (isCallable(defaultProps)) {
            return defaultProps.call(clazzInstance);
        }
        if (isString(defaultProps)) {
            return this.createAndGetDefaultProps(clazzInstance, clazzInstance[defaultProps]);
        }
        if (isObject(defaultProps)) {
            return defaultProps;
        }
    }
}
