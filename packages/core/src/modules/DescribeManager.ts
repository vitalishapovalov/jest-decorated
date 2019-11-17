import {
    Class,
    ITestRunner,
    IHooksManager,
    ITestsManager,
    IDescribeManager,
    IImportsManager,
    IMocksManager,
} from "@jest-decorated/shared";
import HooksManager from "./HooksManager";
import TestsManager from "./TestsManager";
import DefaultTestRunner from "./DefaultTestRunner";
import ImportsManager from "./ImportsManager";
import MocksManager from "./MocksManager";

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
        private readonly testsManager: ITestsManager = new TestsManager(clazzInstance),
        private readonly importsManager: IImportsManager = new ImportsManager(clazz),
        private readonly mocksManager: IMocksManager = new MocksManager(clazz, clazzInstance)
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

    public getImportsManager(): IImportsManager {
        return this.importsManager;
    }

    public getMocksManager(): IMocksManager {
        return this.mocksManager;
    }

    public async registerDescribeInJest(describeName: string): Promise<void> {
        describe(describeName, () => {
            this.hooksManager.registerHooksInJest();
            this.testRunner.beforeTestsJestRegistration(this);
            this.testRunner.registerTestsInJest(this);
            this.testRunner.afterTestsJestRegistration(this);
        });
    }
}
