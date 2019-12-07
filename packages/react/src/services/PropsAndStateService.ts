import { ReactWrapper } from "enzyme";
import { isCallable, isUndefined } from "@js-utilities/typecheck";
import {
    IComponentService,
    IPropsAndStateService,
    PreProcessor,
    PreProcessorData,
    TestEntity
} from "@jest-decorated/shared";

export class PropsAndStateService implements IPropsAndStateService {

    private readonly withStateRegistry: { [key: string]: object; } = {};

    private readonly withPropsRegistry: { [key: string]: object; } = {};

    public constructor(private readonly componentService: IComponentService) {}

    public registerWithProps(methodName: string, data: object): void {
        this.withPropsRegistry[methodName] = data;
    }

    public getWithProps(methodName: string): object {
        return this.withPropsRegistry[methodName];
    }

    public registerWithState(methodName: string, data: object): void {
        this.withStateRegistry[methodName] = data;
    }

    public getWithState(methodName: string): object {
        return this.withStateRegistry[methodName];
    }

    public createComponentWithPropsPreProcessor(
        clazzInstance: object,
        componentDataProviderFn: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => ({
            ...data,
            args: await this.getArgsArrayWithReactDataProviders(
                data.args,
                data.testEntity,
                clazzInstance,
                componentDataProviderFn
            ),
        });
    }

    public createWithStatePreProcessor(describeName: string): PreProcessor {
        return async (data: PreProcessorData): Promise<PreProcessorData> => {
            const stateDataProvider = this.getWithState(data.testEntity.name as string);
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
        clazzInstance: object,
        componentDataProviderFn: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): Promise<unknown[]> {
        const propsDataProvider = this.getWithProps(testEntity.name as string);
        const hasDataProviders = Boolean(testEntity.dataProviders.length);
        if (hasDataProviders) {
            // if entity has data providers, means that @WithDataProvider already been declared
            // currently, only @WithDataProvider or @WithProps is supported
            if (propsDataProvider) {
                throw new SyntaxError("Currently, only @WithDataProvider or @WithProps is supported per test at one time");
            }
            return args;
        }
        const defaultProps = this.componentService.createAndGetDefaultProps(clazzInstance);
        return propsDataProvider
            ? await componentDataProviderFn(propsDataProvider, defaultProps)
            : await componentDataProviderFn(defaultProps);
    }
}