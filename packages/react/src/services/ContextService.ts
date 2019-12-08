import { MountRendererProps, ShallowRendererProps } from "enzyme";
import { isCallable, isObject, isString } from "@js-utilities/typecheck";
import {
    Context,
    IContextService,
    IReactExtension,
    ITestsService,
    resolveModule,
    TestEntity,
} from "@jest-decorated/shared";

export class ContextService implements IContextService {

    public readonly defaultContext: Partial<Context> = {};

    private readonly withContextRegistry: Map<PropertyKey, Context> = new Map();

    public registerDefaultContext(defaultContext: Context): void {
        this.defaultContext.value = defaultContext.value;
        this.defaultContext.contextType = defaultContext.contextType;
        this.defaultContext.lib = defaultContext.lib;
    }

    public registerWithContext(methodName: PropertyKey, context: Context): void {
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
        testsService.registerPreProcessor(({ clazzInstance, testEntity, args }) => {
            const ReactDOM = resolveModule("react-dom");
            const ReactDOMRender = ReactDOM.render;

            const contextValue = this.getContextValue(clazzInstance, testEntity);

            ReactDOM.render = (component: React.ElementType, container: HTMLElement) => {
                const element = this.prepareReactElementWithContext(component, contextValue, testEntity);
                ReactDOM.render = ReactDOMRender;
                return ReactDOMRender(element, container);
            };

            return { clazzInstance, testEntity, args: [contextValue, ...args] };
        }, 0);
    }

    private registerEnzymeContext(testsService: ITestsService): void {
        testsService.registerPreProcessor(({ clazzInstance, testEntity, args }) => {
            const enzyme = resolveModule("enzyme");
            const enzymeShallow = enzyme.shallow;
            const enzymeMount = enzyme.mount;

            const contextValue = this.getContextValue(clazzInstance, testEntity);

            for (const type of ["shallow", "mount"]) {
                enzyme[type] = (component: React.ElementType, options: ShallowRendererProps | MountRendererProps = {}) => {
                    const updatedOptions: ShallowRendererProps | MountRendererProps = {
                        ...options,
                        context: {
                            ...options.context,
                            ...this.prepareEnzymeContext(component, contextValue, testEntity)
                        },
                    };
                    enzyme.shallow = enzymeShallow;
                    enzyme.mount = enzymeMount;
                    return enzyme[type](component, updatedOptions);
                };
            }

            return { clazzInstance, testEntity, args: [contextValue, ...args] };
        }, 0);
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
        const React = resolveModule("react");
        const context = this.withContextRegistry.get(testEntity.name)?.contextType
            || this.defaultContext.contextType;
        return React.createElement(
            context.Provider,
            { value: contextValue },
            React.createElement(context.Consumer, null, contextVal => component)
        );
    }

    private prepareEnzymeContext(
        component: React.ElementType,
        contextValue: object,
        testEntity: TestEntity
    ): object {
        const PropTypes = resolveModule("prop-types");
        const componentAsAny = component as any;
        const contextType = this.withContextRegistry.get(testEntity.name)?.contextType
            || this.defaultContext.contextType;

        componentAsAny.type.contextTypes = {};
        if ("_currentValue" in contextType) {
            for (const key of Object.keys((contextType as { _currentValue: object })._currentValue)) {
                componentAsAny.type.contextTypes[key] = PropTypes.any.isRequired;
            }
        }
        for (const key of Object.keys(contextValue)) {
            componentAsAny.type.contextTypes[key] = PropTypes.any.isRequired;
        }
        return contextValue;
    }

    private createAndGetDefaultContext(
        clazzInstance: object,
        defaultContext: Partial<Context> = this.defaultContext
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
