import type { Class, DescribeType } from "@shared/types";
import type { ITestRunner } from ".";
import type {
    ICustomDecoratorsService,
    IHooksService,
    IImportsService,
    IMocksService,
    ITestsService,
} from "../services";

export interface IDescribeRunner {

    getDescribeName(): string;

    setDescribeName(describeName: string): void;

    getDescribeType(): DescribeType;

    setDescribeType(describeType: DescribeType): void;

    setCustomTestRunner(customTestRunner: ITestRunner): void;

    hasCustomTestRunner(): boolean;

    getClass(): Class;

    getClassInstance(): object;

    getHooksService(): IHooksService;

    getTestsService(): ITestsService;

    getImportsService(): IImportsService;

    getMocksService(): IMocksService;

    getCustomDecoratorsService(): ICustomDecoratorsService;

    getTestRunner(): ITestRunner;

    updateDescribe(describeRunner: IDescribeRunner): void;

    registerDescribeInJest(parentDescribeRunner?: IDescribeRunner): void;
}
