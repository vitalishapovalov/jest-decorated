import type { Class, DescribeType } from "@shared/types";
import type { ITestRunner } from ".";
import type { IHooksService, IImportsService, IMocksService, ITestsService } from "../services";

export interface IDescribeRunner {

    getDescribeName(): string;

    setDescribeName(describeName: string): void;

    getDescribeType(): DescribeType;

    setDescribeType(describeType: DescribeType): void;

    getClass(): Class;

    getClassInstance(): object;

    getHooksService(): IHooksService;

    getTestsService(): ITestsService;

    getImportsService(): IImportsService;

    getMocksService(): IMocksService;

    getTestRunner(): ITestRunner;

    setTestRunner(testRunner: ITestRunner): void;

    updateDescribe(describeRunner: IDescribeRunner): void;

    registerDescribeInJest(parentDescribeRunner?: IDescribeRunner): void;
}
