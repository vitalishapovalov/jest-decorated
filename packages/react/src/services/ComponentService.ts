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
    ): object | undefined {
        if (!defaultProps) {
            return;
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

    public inheritComponentProviderWithDefaultProps(
        reactExtension: IReactExtension,
        parentReactExtension: IReactExtension
    ): boolean {
        const componentsService = reactExtension.getComponentService();
        const parentComponentsService = parentReactExtension.getComponentService();

        // parent has component provider, use it
        if (parentComponentsService.isComponentProviderRegistered()) {
            componentsService.registerComponentProvider(
                parentReactExtension.getComponentService().componentProvider.name,
                parentReactExtension.getComponentService().componentProvider.source
            );

            // inherit default props
            const defaultProps = parentComponentsService.componentProvider.defaultProps;
            if (defaultProps && !componentsService.componentProvider.defaultProps) {
                componentsService.registerDefaultProps(defaultProps);
            }
            // inherit act, asyncAct
            componentsService.componentProvider.isAct = parentComponentsService.componentProvider.isAct;
            componentsService.componentProvider.isAsyncAct = parentComponentsService.componentProvider.isAsyncAct;
            return true;
        }
        return false;
    }

    public addComponentToDataProviders(
        reactExtension: IReactExtension,
        describeRunner: IDescribeRunner,
        createComponentPromise: (arg: object | object[], defaultProps?: object) => Promise<unknown[]>
    ): void {
        const testsService = describeRunner.getTestsService();

        for (const providerName of testsService.getDataProviders()) {
            const providerDataWithReactComponent = [];
            const providerData = testsService.getDataProvider(providerName);
            const defaultProps = reactExtension
                .getComponentService()
                .createAndGetDefaultProps(describeRunner.getClassInstance());
            const componentPromise = createComponentPromise(defaultProps);
            for (const providerDataUnit of this.enrichWithDefaultProps(defaultProps, providerData) as unknown[]) {
                providerDataWithReactComponent.push(isArray(providerDataUnit)
                    ? [componentPromise, ...providerDataUnit]
                    : [componentPromise, providerDataUnit]
                );
            }
            testsService.registerDataProvider(providerName, providerDataWithReactComponent);
        }
    }

    public enrichWithDefaultProps(
        defaultProps: object,
        dataProvider: object | object[],
        merge: boolean = false
    ): object | unknown[] {
        if (isArray(dataProvider)) {
            return dataProvider.map((dataProviderEntry) => {
                if (isArray(dataProviderEntry)) {
                    return [defaultProps, ...dataProviderEntry];
                }
                if (isObject(dataProvider) && merge) {
                    return { ...defaultProps, ...dataProviderEntry };
                }
                return [defaultProps, dataProviderEntry];
            });
        }
        if (isObject(dataProvider) && merge) {
            return { ...defaultProps, ...dataProvider };
        }
        return [defaultProps, dataProvider];
    }
}
