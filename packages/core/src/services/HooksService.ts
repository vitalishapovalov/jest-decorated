import { IHooksService, Hook } from "@jest-decorated/shared";
import { isCallable } from "@js-utilities/typecheck";

export class HooksService implements IHooksService {

    public readonly hooks: Map<Hook, (PropertyKey | (() => any))[]> = new Map()
        .set(Hook.BEFORE_ALL, [])
        .set(Hook.BEFORE_EACH, [])
        .set(Hook.AFTER_ALL, [])
        .set(Hook.AFTER_EACH, []);

    public constructor(private readonly clazzInstance: object) {}

    public registerHook(hook: Hook, name: PropertyKey | (() => any)): void {
        this.hooks.get(hook).push(name);
    }

    public mergeInAll(hooksService: IHooksService): void {
        for (const [hook, names] of hooksService.hooks.entries()) {
            names.forEach(name => this.registerHook(hook, name));
        }
    }

    public registerHooksInJest(): void {
        for (const [hook, names] of this.hooks.entries()) {
            names.forEach(name => this.registerHookInJest(hook, name));
        }
    }

    public registerHookInJest(hook: Hook, hookValue: PropertyKey | (() => any)): void {
        const handler = async () => isCallable(hookValue)
            ? await hookValue()
            : await this.clazzInstance[hookValue].call(this.clazzInstance);
        switch (hook) {
            case Hook.BEFORE_ALL:
                beforeAll(handler);
                break;
            case Hook.BEFORE_EACH:
                beforeEach(handler);
                break;
            case Hook.AFTER_ALL:
                afterAll(handler);
                break;
            case Hook.AFTER_EACH:
                afterEach(handler);
                break;
            default: break;
        }
    }
}
