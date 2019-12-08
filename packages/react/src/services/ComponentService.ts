import {
    Class,
    ComponentProvider,
    IComponentService,
    resolveModule,
    extractModuleDefault,
    IReactExtension, IDescribeRunner
} from "@jest-decorated/shared";
import { isArray, isCallable, isObject, isString } from "@js-utilities/typecheck";

export class ComponentService implements IComponentService {

    public readonly componentProvider: Partial<ComponentProvider> = {};

    private readonly actWrappers: Map<string, boolean> = new Map();

    private componentContainers: Map<string, [string, unknown]> = new Map();

    private importedComponent: unknown | Promise<unknown> = null;

    public constructor(private clazz: Class) {}

    public registerActWrapper(name: string, isAsync?: boolean): void {
        this.actWrappers.set(name, isAsync);
    }

    public registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void {
        this.componentProvider.name = name;
        this.componentProvider.source = source;
    }

    public registerDefaultProps(defaultProps: ComponentProvider["defaultProps"]): void {
        this.componentProvider.defaultProps = defaultProps;
    }

    public registerComponentContainer(name: string, tagName: keyof HTMLElementTagNameMap = "div"): void {
        this.componentContainers.set(name, [tagName, null]);
    }

    public createComponentContainers(): void {
        const { unmountComponentAtNode } = resolveModule("react-dom");
        for (const [name, [tagName]] of this.componentContainers.entries()) {
            let container = null;
            beforeEach(() => {
                container = document.createElement(tagName);
                document.body.appendChild(container);
                this.componentContainers.set(name, [tagName, container]);
            });
            afterEach(() => {
                unmountComponentAtNode(container);
                container.remove();
                container = null;
            });

            const componentService = this;
            Object.defineProperty(this.clazz.prototype, name, {
                get(): unknown {
                    return componentService.componentContainers.get(name)[1];
                },
            });
        }
    }

    public createActWrappers(clazzInstance: object): void {
        for (const [name, isAsync] of this.actWrappers.entries()) {
            if (name === this.componentProvider.name) {
                this.componentProvider.isAct = true;
                this.componentProvider.isAsyncAct = isAsync;
                continue;
            }

            const serviceInstance = this;
            const method = clazzInstance[name].bind(clazzInstance);
            Object.defineProperty(this.clazz.prototype, name, {
                value(...args: unknown[]): unknown {
                    return serviceInstance.runWithAct(method, args, isAsync);
                },
                configurable: true,
            });
        }
    }

    public createAndGetDefaultProps(
        clazzInstance: object,
        defaultProps: unknown = this.componentProvider.defaultProps
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

    public getComponentProvider(): ComponentProvider {
        return this.componentProvider as ComponentProvider;
    }

    public importOrGetComponent(): Promise<unknown> {
        if (!this.importedComponent) {
            return this.importedComponent = new Promise<unknown>((resolve) => {
                const component = resolveModule(this.componentProvider.source);
                resolve(extractModuleDefault(component));
            });
        }
        return this.importedComponent as Promise<unknown>;
    }

    public isComponentProviderRegistered(): boolean {
        return Boolean(this.componentProvider.name);
    }

    public runWithAct(method: Function, args: unknown[], isAsync: boolean): unknown {
        let val = null;
        const { act } = resolveModule("react-dom/test-utils");
        const func = isAsync
            ? async () => {
                await act(async () => {
                    val = await method(...args);
                });
                return val;
            }
            : () => {
                act(() => {
                    val = method(...args);
                });
                return val;
            };
        return func();
    }

    public inheritComponentProviderWithDefaultProps(parentReactExtension?: IReactExtension): boolean {
        const parentComponentsService = parentReactExtension?.getComponentService();

        // parent has component provider, use it
        if (
            !this.isComponentProviderRegistered()
            && parentComponentsService?.isComponentProviderRegistered()
        ) {
            this.registerComponentProvider(
                parentComponentsService.componentProvider.name,
                parentComponentsService.componentProvider.source
            );

            // inherit default props
            const defaultProps = parentComponentsService.componentProvider.defaultProps;
            if (defaultProps && !this.componentProvider.defaultProps) {
                this.registerDefaultProps(defaultProps);
            }
            // inherit act, asyncAct
            this.componentProvider.isAct = parentComponentsService.componentProvider.isAct;
            this.componentProvider.isAsyncAct = parentComponentsService.componentProvider.isAsyncAct;
            return true;
        }
        return false;
    }
}
