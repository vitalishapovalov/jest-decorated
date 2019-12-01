import { Class, ComponentProvider, IComponentService, resolveModule, extractModuleDefault } from "@jest-decorated/shared";
import { isCallable, isObject, isString } from "@js-utilities/typecheck";

export class ComponentService implements IComponentService {

    public readonly componentProvider: Partial<ComponentProvider> = {};

    private readonly actWrappers: Map<string, boolean> = new Map();

    private componentContainers: Map<string, [string, any]> = new Map();

    private importedComponent: any = null;

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
                get(): any {
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
                value(...args: any[]): any {
                    return serviceInstance.runWithAct(method, args, isAsync);
                },
            });
        }
    }

    public createAndGetDefaultProps(
        clazzInstance: object,
        defaultProps: any = this.componentProvider.defaultProps
    ): object | undefined {
        if (!defaultProps) {
            return;
        }
        if (isCallable(defaultProps)) {
            return defaultProps.call(clazzInstance);
        }
        if (isString(defaultProps)) {
            const props = this.createAndGetDefaultProps(clazzInstance, clazzInstance[defaultProps]);
            Object.defineProperty(this.clazz.prototype, name, {
                get(): any {
                    return props;
                },
            });
            return props;
        }
        if (isObject(defaultProps)) {
            return defaultProps;
        }
    }

    public getComponentProvider(): ComponentProvider {
        return this.componentProvider as ComponentProvider;
    }

    public importOrGetComponent<T>(): Promise<T> {
        if (!this.importedComponent) {
            return this.importedComponent = new Promise<T>((resolve) => {
                const component = resolveModule(this.componentProvider.source);
                resolve(extractModuleDefault(component));
            });
        }
        return this.importedComponent;
    }

    public isComponentProviderRegistered(): boolean {
        return Boolean(this.componentProvider.name);
    }

    public runWithAct(method: Function, args: any[], isAsync: boolean): any {
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
}
