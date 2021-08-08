import type {
    Class,
    ITestRunner,
    IHooksService,
    ITestsService,
    IDescribeRunner,
    IImportsService,
    IMocksService,
} from "@jest-decorated/shared";
import { DescribeType } from "@jest-decorated/shared";

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
    private describeType: DescribeType;

    private constructor(
        private readonly clazz: Class,
        private readonly clazzInstance: object = new clazz(),
        private readonly testsService: ITestsService = new TestsService(clazzInstance),
        private readonly hooksService: IHooksService = new HooksService(clazzInstance, testsService),
        private readonly importsService: IImportsService = new ImportsService(clazz),
        private readonly mocksService: IMocksService = new MocksService(clazz, clazzInstance)
    ) {}

    public getDescribeName(): string {
        return this.describeName;
    }

    public setDescribeName(describeName: string): void {
        this.describeName = describeName;
    }

    public getDescribeType(): DescribeType {
        return this.describeType;
    }

    public setDescribeType(describeType: DescribeType): void {
        this.describeType = describeType;
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

    public updateDescribe(describeRunner: IDescribeRunner): void {
        this.mocksService.mergeInAll(describeRunner.getMocksService());
        this.hooksService.mergeInAll(describeRunner.getHooksService());
        this.testsService.mergeInDataProviders(describeRunner.getTestsService());
        this.setTestRunner(describeRunner.getTestRunner());
    }

    public registerDescribeInJest(parentDescribeService?: IDescribeRunner): void {
        this.getCurrentDescribeFunction()(this.describeName, () => {
            this.testRunner.registerMocks(this, parentDescribeService);
            this.testRunner.registerAutoCleared(this, parentDescribeService);
            this.testRunner.registerLazyModules(this, parentDescribeService);
            this.testRunner.registerMockFnsAndSpies(this, parentDescribeService);
            this.testRunner.registerHooks(this, parentDescribeService);
            this.testRunner.registerTestsInJest(this, parentDescribeService);
        });
    }

    protected getCurrentDescribeFunction(): typeof describe {
        switch (this.describeType) {
            case DescribeType.ONLY:
                return describe.only;
            case DescribeType.SKIP:
                return describe.skip;
            case DescribeType.DEFAULT:
            default:
                return describe;
        }
    }
}
