import {
    Class,
    ITestRunner,
    IHooksService,
    ITestsService,
    IDescribeRunner,
    IImportsService,
    IMocksService,
} from "@jest-decorated/shared";
import { TestRunner } from "./TestRunner";
import { HooksService, TestsService, ImportsService, MocksService } from "../services";

export class DescribeRunner implements IDescribeRunner {

    private static readonly DESCRIBE_REGISTRY: WeakMap<Class, IDescribeRunner> = new WeakMap();

    public static getDescribeRunner(clazz?: Class, autoCreate: boolean = true): IDescribeRunner {
        let describeService: IDescribeRunner = DescribeRunner.DESCRIBE_REGISTRY.get(clazz);
        if (!describeService && autoCreate) {
            describeService = new this(clazz);
            DescribeRunner.DESCRIBE_REGISTRY.set(clazz, describeService);
        }
        return describeService;
    }

    private testRunner: ITestRunner = new TestRunner();

    private describeName: string;

    private constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object = new clazz(),
        private readonly hooksService: IHooksService = new HooksService(clazzInstance),
        private readonly testsService: ITestsService = new TestsService(clazzInstance),
        private readonly importsService: IImportsService = new ImportsService(clazz),
        private readonly mocksService: IMocksService = new MocksService(clazz, clazzInstance)
    ) {}

    public getDescribeName(): string {
        return this.describeName;
    }

    public setDescribeName(describeName: string): void {
        this.describeName = describeName;
    }

    public getClass(): Class {
        return this.clazz;
    }

    public getClassInstance(): object {
        return this.clazzInstance;
    }

    public getHooksService(): IHooksService {
        return this.hooksService;
    }

    public getTestsService(): ITestsService {
        return this.testsService;
    }

    public getImportsService(): IImportsService {
        return this.importsService;
    }

    public getMocksService(): IMocksService {
        return this.mocksService;
    }

    public getTestRunner(): ITestRunner {
        return this.testRunner;
    }

    public setTestRunner(testRunner: ITestRunner): void {
        this.testRunner = testRunner;
    }

    public registerDescribeInJest(parentDescribeService?: IDescribeRunner): void {
        if (parentDescribeService) {
            this.updateDescribe(parentDescribeService);
        }
        describe(this.describeName, () => {
            beforeAll(() => {
                this.testRunner.beforeTestsJestRegistration(this, parentDescribeService);
            });
            this.hooksService.registerHooksInJest();
            this.testRunner.registerTestsInJest(this, parentDescribeService);
            afterAll(() => {
                this.testRunner.afterTestsJestRegistration(this, parentDescribeService);
            });
        });
    }

    private updateDescribe(describeRunner: IDescribeRunner): void {
        this.mocksService.mergeInAll(describeRunner.getMocksService());
        this.hooksService.mergeInAll(describeRunner.getHooksService());
        this.testsService.mergeInDataProviders(describeRunner.getTestsService());
        this.setTestRunner(describeRunner.getTestRunner());
    }
}
