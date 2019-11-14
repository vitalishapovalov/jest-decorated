import { Class } from "../types";
import HooksManager from "./HooksManager";
import TestsManager from "./TestsManager";
import { ITestRunner, TestRunner } from "./TestRunner";

export default class DescribeManager {

    private static readonly DESCRIBE_MANAGER: symbol = Symbol();

    private static testRunner: ITestRunner = new TestRunner();

    public static getTestRunner(): ITestRunner {
        return this.testRunner;
    }

    public static setTestRunner(testRunner: ITestRunner): void {
        this.testRunner = testRunner;
    }

    public static getDescribeManager(clazz?: Class, autoCreate: boolean = true): DescribeManager {
        let describeManager: DescribeManager = Reflect.getOwnMetadata(this.DESCRIBE_MANAGER, clazz);
        if (!describeManager && autoCreate) {
            describeManager = new this(clazz);
            Reflect.defineMetadata(this.DESCRIBE_MANAGER, describeManager, clazz);
        }
        return describeManager;
    }

    private readonly extensions: Map<PropertyKey, any> = new Map();

    private constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object = new clazz(),
        private readonly hooksManager: HooksManager = new HooksManager(clazzInstance),
        private readonly testsManager: TestsManager = new TestsManager(clazzInstance)
    ) {}

    public getExtension<T = any>(name: PropertyKey): T {
        return this.extensions.get(name);
    }

    public registerExtension(name: PropertyKey, extension: any): void {
        this.extensions.set(name, extension);
    }

    public getClassInstance(): object {
        return this.clazzInstance;
    }

    public getHooksManager(): HooksManager {
        return this.hooksManager;
    }

    public getTestsManager(): TestsManager {
        return this.testsManager;
    }

    public registerDescribeInJest(describeName?: string): void {
        describe(describeName, () => {
            this.hooksManager.registerHooksInJest();
            DescribeManager.testRunner.beforeTestsJestRegistration();
            DescribeManager.testRunner.registerTestsInJest(this);
            DescribeManager.testRunner.afterTestsJestRegistration();
        });
    }
}
