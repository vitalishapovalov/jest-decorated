import { MountRendererProps, ShallowRendererProps } from "enzyme";
import { isCallable, isObject, isString } from "@js-utilities/typecheck";
import {
    ComponentContext,
    IContextService,
    IReactExtension,
    ITestsService,
    resolveModule,
    TestEntity,
} from "@jest-decorated/shared";

import { ComponentService } from "./ComponentService";

export class ContextService implements IContextService {

    public readonly defaultContext: Partial<ComponentContext> = {};

    private readonly withContextRegistry: Map<PropertyKey, ComponentContext> = new Map();

    public registerDefaultContext(defaultContext: ComponentContext): void {
        this.defaultContext.value = defaultContext.value;
        this.defaultContext.contextType = defaultContext.contextType;
        this.defaultContext.lib = defaultContext.lib;
    }

    public registerWithContext(methodName: PropertyKey, context: ComponentContext): void {
        this.withContextRegistry.set(methodName, context);
    }

    public registerContextProcessor(testsService: ITestsService): void {
        // no context at all
        if (!this.defaultContext.contextType && !this.withContextRegistry.size) {
            return;
        }
        // we assume that if any context of Describe has lib "A" -> all of the contexts have lib "A"
        const expectedLib = this.defaultContext.lib ?? [...this.withContextRegistry.values()][0].lib;
        switch (expectedLib) {
            case "react-dom":
                this.registerReactDOMContext(testsService);
                return;
            case "enzyme":
                this.registerEnzymeContext(testsService);
                return;
        }
    }

    public inheritDefaultContext(parentReactExtension?: IReactExtension): void {
        const parentDefaultContext = parentReactExtension?.getContextService().defaultContext;
        if (!this.defaultContext.contextType && parentDefaultContext?.contextType) {
            this.registerDefaultContext(parentDefaultContext);
        }
    }

    private registerReactDOMContext(testsService: ITestsService): void {
        testsService.registerPreProcessor(
            ({ clazzInstance, testEntity, args }) => {
                const reactDOM = resolveModule("react-dom");
                const reactDOMRender = reactDOM.render;

                const contextValue = this.getContextValue(clazzInstance, testEntity);

                reactDOM.render = (component: React.ElementType, container: HTMLElement) => {
                    const element = this.prepareReactElementWithContext(component, contextValue, testEntity);
                    reactDOM.render = reactDOMRender;
                    return reactDOMRender(element, container);
                };

                return {
                    clazzInstance,
                    testEntity,
                    args: [{ context: contextValue, [ComponentService.STATE_PROPS_CONTEXT_ARG]: true }, ...args],
                };
            },
            0
        );
    }

    private registerEnzymeContext(testsService: ITestsService): void {
        testsService.registerPreProcessor(
            ({ clazzInstance, testEntity, args }) => {
                const enzyme = resolveModule("enzyme");
                const enzymeShallow = enzyme.shallow;
                const enzymeMount = enzyme.mount;
                const enzymeRender = enzyme.render;

                const contextValue = this.getContextValue(clazzInstance, testEntity);

                for (const type of ["shallow", "mount", "render"]) {
                    enzyme[type] = (component: React.ElementType, options: ShallowRendererProps | MountRendererProps = {}) => {
                        const updatedOptions: ShallowRendererProps | MountRendererProps = {
                            ...options,
                            context: {
                                ...options.context,
                                ...this.prepareEnzymeContext(component, contextValue, testEntity),
                            },
                        };
                        enzyme.shallow = enzymeShallow;
                        enzyme.mount = enzymeMount;
                        enzyme.render = enzymeRender;
                        return enzyme[type](component, updatedOptions);
                    };
                }

                return {
                    clazzInstance,
                    testEntity,
                    args: [{ context: contextValue, [ComponentService.STATE_PROPS_CONTEXT_ARG]: true }, ...args],
                };
            },
            0
        );
    }

    private getContextValue(clazzInstance: object, testEntity: TestEntity): object {
        return {
            ...this.createAndGetDefaultContext(clazzInstance),
            ...this.withContextRegistry.get(testEntity.name)?.value,
        };
    }

    private prepareReactElementWithContext(
        component: React.ElementType,
        contextValue: object,
        testEntity: TestEntity
    ): React.ElementType {
        const react = resolveModule("react");
        const context = this.withContextRegistry.get(testEntity.name)?.contextType
            || this.defaultContext.contextType;
        return react.createElement(
            context.Provider,
            { value: contextValue },
            react.createElement(context.Consumer, null, contextVal => component)
        );
    }

    private prepareEnzymeContext(
        component: React.ElementType,
        contextValue: object,
        testEntity: TestEntity
    ): object {
        const propTypes = resolveModule("prop-types");
        const componentAsAny = component as any;
        const contextType = this.withContextRegistry.get(testEntity.name)?.contextType
            || this.defaultContext.contextType;

        componentAsAny.type.contextTypes = {};
        if ("_currentValue" in contextType) {
            for (const key of Object.keys((contextType as { _currentValue: object })._currentValue)) {
                componentAsAny.type.contextTypes[key] = propTypes.any.isRequired;
            }
        }
        for (const key of Object.keys(contextValue)) {
            componentAsAny.type.contextTypes[key] = propTypes.any.isRequired;
        }
        return contextValue;
    }

    private createAndGetDefaultContext(
        clazzInstance: object,
        defaultContext: Partial<ComponentContext> = this.defaultContext
    ): object | undefined {
        if (!defaultContext.contextType || !defaultContext.value) {
            return;
        }
        if (isCallable(defaultContext.value)) {
            return defaultContext.value.call(clazzInstance);
        }
        if (isString(defaultContext.value)) {
            return this.createAndGetDefaultContext(clazzInstance, {
                ...defaultContext,
                value: clazzInstance[defaultContext.value],
            });
        }
        if (isObject(defaultContext.value)) {
            return defaultContext.value;
        }
    }
}
