import { Class } from "@jest-decorated/shared";

import { ComponentService } from "../services";

export class ReactExtension {

    private static readonly REACT_EXT_REGISTRY: WeakMap<Class, ReactExtension> = new WeakMap();

    public static getReactExtension(clazz?: Class, autoCreate: boolean = true): ReactExtension {
        let reactExtension = ReactExtension.REACT_EXT_REGISTRY.get(clazz);
        if (!reactExtension && autoCreate) {
            reactExtension = new this(clazz);
            ReactExtension.REACT_EXT_REGISTRY.set(clazz, reactExtension);
        }
        return reactExtension;
    }

    private readonly withPropsRegistry: { [key: string]: object | object[]; } = {};
    private readonly withStateRegistry: { [key: string]: object; } = {};

    private constructor(
        private readonly clazz: Class,
        private readonly componentService: ComponentService = new ComponentService()
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
