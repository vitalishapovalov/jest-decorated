import { Hook } from "../types";

export interface IHooksManager {

    readonly hooks: Map<Hook, PropertyKey[]>;

    registerHook(hook: Hook, name: PropertyKey): void;

    registerHooksInJest(): void;

    registerHookInJest(hook: Hook, name: PropertyKey): void;

    update(hooksManager: IHooksManager): void;
}
