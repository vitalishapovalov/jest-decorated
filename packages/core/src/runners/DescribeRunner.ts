import type {
    Class,
    CustomDecorator,
    CustomDecoratorHandlerConstructor,
    CustomDecoratorDefaultArgs,
    ICustomDecoratorsService,
    IDescribeRunner,
    IHooksService,
    IImportsService,
    IMocksService,
    ITestRunner,
    ITestsService,
} from "@jest-decorated/shared";
import debug from "debug";
import { isUndefined } from "@js-utilities/typecheck";
import { DescribeType, CustomDecoratorType } from "@jest-decorated/shared";

import { TestRunner } from "./TestRunner";
import { CustomDecoratorsService, HooksService, ImportsService, MocksService, TestsService } from "../services";

export class DescribeRunner implements IDescribeRunner {

    private static readonly log = debug("jest-decorated:core:DescribeRunner");

    private static readonly DESCRIBE_REGISTRY: WeakMap<Class, IDescribeRunner> = new WeakMap();

    public static getDescribeRunner(clazz?: Class, autoCreate: boolean = true): IDescribeRunner {
        let describeService: IDescribeRunner = DescribeRunner.DESCRIBE_REGISTRY.get(clazz);
        if (!describeService && autoCreate) {
            describeService = new this(clazz);
            DescribeRunner.DESCRIBE_REGISTRY.set(clazz, describeService);
        }
        return describeService;
    }

    public static createCustomDecorator<Args extends CustomDecoratorDefaultArgs = []>(
        customDecoratorHandlerConstructor: CustomDecoratorHandlerConstructor<Args>
    ): CustomDecorator<Args> {
        return (...args: Args) => function (target: object | Class, propertyKey?: PropertyKey, propertyDescriptor?: PropertyDescriptor) {
            const isClass = isUndefined(propertyKey);
            const clazz = (isClass ? target : target.constructor) as Class;
            const customDecoratorHandlerInstance = new customDecoratorHandlerConstructor(args, clazz, propertyKey, propertyDescriptor);
            const describeRunner = DescribeRunner.getDescribeRunner(clazz);
            describeRunner.getCustomDecoratorsService().registerCustomDecorator(
                isClass ? CustomDecoratorType.CLASS : CustomDecoratorType.METHOD,
                customDecoratorHandlerInstance,
                args,
                describeRunner,
                propertyKey
            );
        };
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
        private readonly mocksService: IMocksService = new MocksService(clazz, clazzInstance),
        private readonly customDecoratorsService: ICustomDecoratorsService = new CustomDecoratorsService(testsService)
    ) {
        DescribeRunner.log(`New instance created for clazz: ${clazz.name}`);
    }

    public getDescribeName(): string {
        return this.describeName;
    }

    public setDescribeName(describeName: string): void {
        DescribeRunner.log(`Setting describe name: ${describeName}`);
        this.describeName = describeName;
    }

    public getDescribeType(): DescribeType {
        return this.describeType;
    }

    public setDescribeType(describeType: DescribeType): void {
        DescribeRunner.log(`Setting describe type: ${describeType}`);
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

    public getCustomDecoratorsService(): ICustomDecoratorsService {
        return this.customDecoratorsService;
    }

    public getTestRunner(): ITestRunner {
        return this.testRunner;
    }

    public setTestRunner(testRunner: ITestRunner): void {
        DescribeRunner.log(`Setting test runner: ${String(testRunner)}`);
        this.testRunner = testRunner;
    }

    public updateDescribe(describeRunner: IDescribeRunner): void {
        DescribeRunner.log(`Updating describe. Update describe name: ${describeRunner.getDescribeName()}`);
        this.mocksService.mergeInAll(describeRunner.getMocksService());
        this.hooksService.mergeInAll(describeRunner.getHooksService());
        this.customDecoratorsService.mergeInAll(describeRunner.getCustomDecoratorsService(), this);
        this.testsService.mergeInDataProviders(describeRunner.getTestsService());
        this.setTestRunner(describeRunner.getTestRunner());
    }

    public registerDescribeInJest(parentDescribeService?: IDescribeRunner): void {
        DescribeRunner.log(`Registering jest describe. Describe type: ${this.describeType}; Parent describe: ${String(parentDescribeService)}`);
        this.getCurrentDescribeFunction()(this.describeName, () => {
            this.testRunner.registerCustomDecoratorsPre(this, parentDescribeService);
            this.testRunner.registerMocks(this, parentDescribeService);
            this.testRunner.registerAutoCleared(this, parentDescribeService);
            this.testRunner.registerLazyModules(this, parentDescribeService);
            this.testRunner.registerMockFnsAndSpies(this, parentDescribeService);
            this.testRunner.registerHooks(this, parentDescribeService);
            this.testRunner.registerTestsInJest(this, parentDescribeService);
            this.testRunner.registerCustomDecoratorsPost(this, parentDescribeService);
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
