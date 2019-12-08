import { Class, IComponentService, IContextService, IPropsAndStateService, IReactExtension } from "@jest-decorated/shared";

import { ComponentService, ContextService, PropsAndStateService } from "../services";

export class ReactExtension implements IReactExtension {

    private static readonly REACT_EXT_REGISTRY: WeakMap<Class, IReactExtension> = new WeakMap();

    public static getReactExtension(clazz?: Class, autoCreate: boolean = true): IReactExtension | null {
        if (!clazz) return null;
        let reactExtension = ReactExtension.REACT_EXT_REGISTRY.get(clazz);
        if (!reactExtension && autoCreate) {
            reactExtension = new this(clazz);
            ReactExtension.REACT_EXT_REGISTRY.set(clazz, reactExtension);
        }
        return reactExtension;
    }

    private constructor(
        private readonly clazz: Class,
        private readonly componentService: IComponentService = new ComponentService(clazz),
        private readonly propsAndStateService: IPropsAndStateService = new PropsAndStateService(componentService),
        private readonly contextService: IContextService = new ContextService()
    ) {}

    public getComponentService(): IComponentService {
        return this.componentService;
    }

    public getPropsAndStateService(): IPropsAndStateService {
        return this.propsAndStateService;
    }

    public getContextService(): IContextService {
        return this.contextService;
    }
}
