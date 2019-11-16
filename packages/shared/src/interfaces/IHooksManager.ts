import { Hook } from "../types";

export interface IHooksManager {

    registerHook(hook: Hook, name: PropertyKey): void;

    registerHooksInJest(): void;

    registerHookInJest(hook: Hook, name: PropertyKey): void;
}