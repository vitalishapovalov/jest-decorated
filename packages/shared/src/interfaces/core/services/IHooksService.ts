import { Hook } from "@shared/types";

export interface IHooksService {

    readonly hooks: Map<Hook, (PropertyKey | (() => any))[]>;

    registerHook(hook: Hook, name: PropertyKey): void;

    mergeInAll(hooksService: IHooksService): void;

    registerHooksInJest(): void;

    registerHookInJest(hook: Hook, name: PropertyKey): void;
}
