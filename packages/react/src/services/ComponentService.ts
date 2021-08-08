import type { Class, ComponentProvider, IComponentService, IReactExtension } from "@jest-decorated/shared";
import debug from "debug";
import { resolveModule, extractModuleDefault } from "@jest-decorated/shared";

export class ComponentService implements IComponentService {

    private static readonly log = debug("jest-decorated:react:ComponentService");

    public static readonly STATE_PROPS_CONTEXT_ARG: unique symbol = Symbol();

    public readonly componentProvider: Partial<ComponentProvider> = {};

    private readonly actWrappers: Map<string, boolean> = new Map();

    private componentContainers: Map<string, [string, unknown]> = new Map();

    private importedComponent: unknown | Promise<unknown> = null;

    public constructor(private clazz: Class) {
        ComponentService.log("New instance crated");
    }

    public registerActWrapper(name: string, isAsync?: boolean): void {
        ComponentService.log(`Registering act wrapper. Name: ${name}; Async: ${isAsync}`);
        this.actWrappers.set(name, isAsync);
    }

    public registerComponentProvider(
        name: ComponentProvider["name"],
        source: ComponentProvider["source"]
    ): void {
        ComponentService.log(`Registering component provider. Name: ${String(name)}; Source: ${source}`);
        this.componentProvider.name = name;
        this.componentProvider.source = source;
    }

    public registerDefaultProps(defaultProps: ComponentProvider["defaultProps"]): void {
        ComponentService.log(`Registering default props. Default props: ${defaultProps}`);
        this.componentProvider.defaultProps = defaultProps;
    }

    public registerComponentContainer(name: string, tagName: keyof HTMLElementTagNameMap): void {
        ComponentService.log(`Registering component container. Name: ${name}; Tag name: ${tagName}`);
        this.componentContainers.set(name, [tagName, null]);
    }

    public createComponentContainers(): void {
        ComponentService.log("Creating component containers...");
        const { unmountComponentAtNode } = resolveModule("react-dom");
        for (const [name, [tagName]] of this.componentContainers.entries()) {
            ComponentService.log(`Creating component container.... Name: ${name}; Tag name: ${tagName}`);

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
                configurable: true,
            });
            ComponentService.log(`Creating component container DONE. Name: ${name}; Tag name: ${tagName}`);
        }
        ComponentService.log("Creating component containers DONE");
    }

    public createActWrappers(clazzInstance: object): void {
        ComponentService.log("Creating act wrappers...");
        for (const [name, isAsync] of this.actWrappers.entries()) {
            if (name === this.componentProvider.name) {
                this.componentProvider.isAct = true;
                this.componentProvider.isAsyncAct = isAsync;
                continue;
            }

            ComponentService.log(`Creating act wrapper. Name: ${name}`);
            const serviceInstance = this;
            const method = clazzInstance[name].bind(clazzInstance);
            Object.defineProperty(this.clazz.prototype, name, {
                value(...args: unknown[]): unknown {
                    return serviceInstance.runWithAct(method, args, isAsync);
                },
                configurable: true,
                writable: true,
            });
        }
        ComponentService.log("Creating act wrappers DONE");
    }

    public getComponentProvider(): ComponentProvider {
        return this.componentProvider as ComponentProvider;
    }

    public importOrGetComponent(): Promise<unknown> {
        if (!this.importedComponent) {
            ComponentService.log("Importing component...");
            const importedComponent = this.importedComponent = new Promise<unknown>((resolve) => {
                const component = resolveModule(this.componentProvider.source);
                resolve(extractModuleDefault(component));
            });
            ComponentService.log("Importing component DONE");
            return importedComponent;
        }
        return this.importedComponent as Promise<unknown>;
    }

    public isComponentProviderRegistered(): boolean {
        return Boolean(this.componentProvider.name);
    }

    public runWithAct(method: Function, args: unknown[], isAsync: boolean): unknown {
        ComponentService.log(`Running with act. Method: ${method}; Args: ${args}; Async: ${isAsync}`);

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
        ComponentService.log("Inheriting component providers...");

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

        ComponentService.log("Inheriting component providers DONE");

        return false;
    }
}
