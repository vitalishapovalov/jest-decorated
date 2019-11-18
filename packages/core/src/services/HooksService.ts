import { IHooksService, Hook } from "@jest-decorated/shared";

export class HooksService implements IHooksService {

    public readonly hooks: Map<Hook, PropertyKey[]> = new Map()
        .set(Hook.BEFORE_ALL, [])
        .set(Hook.BEFORE_EACH, [])
        .set(Hook.AFTER_ALL, [])
        .set(Hook.AFTER_EACH, []);

    public constructor(private readonly clazzInstance: object) {}

    public mergeInAll(hooksService: IHooksService): void {
        for (const [hook, names] of hooksService.hooks) {
            names.forEach(name => this.registerHook(hook, name));
        }
    }

    public registerHook(hook: Hook, name: PropertyKey): void {
        this.hooks.get(hook).push(name);
    }

    public registerHooksInJest(): void {
        for (const [hook, names] of this.hooks.entries()) {
            names.forEach(name => this.registerHookInJest(hook, name));
        }
    }

    public registerHookInJest(hook: Hook, name: PropertyKey): void {
        const handler = async () => await this.clazzInstance[name].call(this.clazzInstance);
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
