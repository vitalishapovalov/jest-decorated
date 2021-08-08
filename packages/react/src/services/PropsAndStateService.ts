import type { ReactWrapper } from "enzyme";
import type {
    IComponentService,
    IDescribeRunner,
    IPropsAndStateService,
    PreProcessor,
    PreProcessorData,
} from "@jest-decorated/shared";
import debug from "debug";
import chalk from "chalk";
import { isCallable, isObject, isString, isUndefined } from "@js-utilities/typecheck";

import { ComponentService } from "./ComponentService";

export class PropsAndStateService implements IPropsAndStateService {

    private static readonly log = debug("jest-decorated:react:PropsAndStateService");

    private readonly withStateRegistry: Map<string, object> = new Map();

    private readonly withPropsRegistry: Map<string, object> = new Map();

    public constructor(private readonly componentService: IComponentService) {
        PropsAndStateService.log("New instance crated");
    }

    public registerWithProps(methodName: string, data: object): void {
        PropsAndStateService.log(`Registering with props. Method name: ${methodName}; Data: ${data}`);
        this.withPropsRegistry.set(methodName, data);
    }

    public getWithProps(methodName: string): object {
        return this.withPropsRegistry.get(methodName);
    }

    public registerWithState(methodName: string, data: object): void {
        PropsAndStateService.log(`Registering with state. Method name: ${methodName}; Data: ${data}`);
        this.withStateRegistry.set(methodName, data);
    }

    public getWithState(methodName: string): object {
        return this.withStateRegistry.get(methodName);
    }

    public createComponentWithPropsPreProcessor(describeRunner: IDescribeRunner): PreProcessor {
        PropsAndStateService.log(`Creating component with props pre-processor. Describe runner: ${describeRunner}`);
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            PropsAndStateService.log("component with props pre-processor executing...");
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
            const result = {
                ...data,
                args: [
                    component,
                    ...(hasPropsAndStateObj
                        ? []
                        : [{ props, [ComponentService.STATE_PROPS_CONTEXT_ARG]: true }]),
                    ...mappedArgs,
                ],
            };
            PropsAndStateService.log("component with props pre-processor executing DONE");
            return result;
        };
    }

    public createWithStatePreProcessor(describeName: string): PreProcessor {
        PropsAndStateService.log(`Creating withState pre-processor. Describe name: ${describeName}`);
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            PropsAndStateService.log("withState pre-processor executing...");
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
            PropsAndStateService.log("withState pre-processor executing DONE");
            return data;
        };
    }

    private async getComponentProviderResultAndProps(
        describe: IDescribeRunner,
        props: object | object[],
        defaultProps?: object
    ): Promise<[unknown, object]> {
        PropsAndStateService.log("Getting component provider result with props...");
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
            PropsAndStateService.log("Getting component provider result with props DONE");
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
        PropsAndStateService.log("Create and get default props");
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
