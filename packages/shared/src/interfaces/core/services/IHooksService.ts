import type { Hook } from "@shared/types";

export interface IHooksService {

    readonly beforeTestHooks: Map<PropertyKey, (clazzInstance?: object) => any>;

    readonly hooks: Map<Hook, (PropertyKey | (() => any))[]>;

    registerHook(hook: Hook, name: PropertyKey): void;

    registerBeforeTestHook(name: PropertyKey, impl: (clazzInstance?: any) => any): void;

    mergeInAll(hooksService: IHooksService): void;

    registerHooksInJest(): void;
}
