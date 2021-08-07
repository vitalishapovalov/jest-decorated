import type { IHooksService, PreProcessorData, ITestsService } from "@jest-decorated/shared";
import { Hook } from "@jest-decorated/shared";
import { isCallable } from "@js-utilities/typecheck";

export class HooksService implements IHooksService {

    public readonly beforeTestHooks: Map<PropertyKey, (clazzInstance?: any) => any> = new Map();

    public readonly hooks: Map<Hook, (PropertyKey | (() => any))[]> = new Map()
        .set(Hook.BEFORE_ALL, [])
        .set(Hook.BEFORE_EACH, [])
        .set(Hook.AFTER_ALL, [])
        .set(Hook.AFTER_EACH, []);

    public constructor(
        private readonly clazzInstance: object,
        private readonly testsService: ITestsService
    ) {
        this.registerBeforeTestHooksPreprocessor();
    }

    public registerHook(hook: Hook, name: PropertyKey | (() => any)): void {
        this.hooks.get(hook).push(name);
    }

    public registerBeforeTestHook(name: PropertyKey, impl: (clazzInstance?: any) => any): void {
        this.beforeTestHooks.set(name, impl);
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

    private registerBeforeTestHooksPreprocessor(): void {
        this.testsService.registerPreProcessor(
            async (preProcessorData: PreProcessorData) => {
                const testName = preProcessorData.testEntity.name;
                if (this.beforeTestHooks.has(testName)) {
                    this.beforeTestHooks.get(testName).call(this.clazzInstance, this.clazzInstance);
                }
                return preProcessorData;
            },
            Number.MIN_SAFE_INTEGER
        );
    }

    private registerHookInJest(hook: Hook, hookValue: PropertyKey | (() => any)): void {
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
