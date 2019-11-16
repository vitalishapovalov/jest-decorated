import { Class, ITestRunner, IHooksManager, ITestsManager, IDescribeManager } from "@jest-decorated/shared";
import HooksManager from "./HooksManager";
import TestsManager from "./TestsManager";
import DefaultTestRunner from "./DefaultTestRunner";

export default class DescribeManager implements IDescribeManager {

    private static readonly DESCRIBE_REGISTRY: WeakMap<Class, IDescribeManager> = new WeakMap();

    public static getDescribeManager(clazz?: Class, autoCreate: boolean = true): IDescribeManager {
        let describeManager: IDescribeManager = DescribeManager.DESCRIBE_REGISTRY.get(clazz);
        if (!describeManager && autoCreate) {
            describeManager = new this(clazz);
            DescribeManager.DESCRIBE_REGISTRY.set(clazz, describeManager);
        }
        return describeManager;
    }

    private testRunner: ITestRunner = new DefaultTestRunner();

    private constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object = new clazz(),
        private readonly hooksManager: IHooksManager = new HooksManager(clazzInstance),
        private readonly testsManager: ITestsManager = new TestsManager(clazzInstance)
    ) {}

    public getClass(): Class {
        return this.clazz;
    }

    public getClassInstance(): object {
        return this.clazzInstance;
    }

    public getHooksManager(): IHooksManager {
        return this.hooksManager;
    }

    public getTestsManager(): ITestsManager {
        return this.testsManager;
    }

    public getTestRunner(): ITestRunner {
        return this.testRunner;
    }

    public setTestRunner(testRunner: ITestRunner): void {
        this.testRunner = testRunner;
    }

    public registerDescribeInJest(describeName: string): void {
        beforeAll(async () => await this.testRunner.beforeTestsJestRegistration(this));
        afterAll(async () => await this.testRunner.afterTestsJestRegistration(this));
        describe(describeName, () => {
            this.hooksManager.registerHooksInJest();
            this.testRunner.registerTestsInJest(this);
        });
    }
}
