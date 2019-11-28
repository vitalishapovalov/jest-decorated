import { Class, IReactExtension } from "@jest-decorated/shared";

import { ComponentService } from "../services";

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

    private readonly withStateRegistry: { [key: string]: object; } = {};
    private readonly withPropsRegistry: { [key: string]: object | object[]; } = {};

    private constructor(
        private readonly clazz: Class,
        private readonly componentService: ComponentService = new ComponentService(clazz)
    ) {}

    public getComponentService(): ComponentService {
        return this.componentService;
    }

    public registerWithProps(methodName: string, data: object | object[]): void {
        this.withPropsRegistry[methodName] = data;
    }

    public getWithProps(methodName: string): object | object[] {
        return this.withPropsRegistry[methodName];
    }

    public registerWithState(methodName: string, data: object): void {
        this.withStateRegistry[methodName] = data;
    }

    public getWithState(methodName: string): object {
        return this.withStateRegistry[methodName];
    }
}
