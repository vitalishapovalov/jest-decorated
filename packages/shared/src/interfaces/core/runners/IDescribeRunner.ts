import { Class } from "@shared/types";
import { ITestRunner } from ".";
import { IHooksService, IImportsService, IMocksService, ITestsService } from "../services";

export interface IDescribeRunner {

    getDescribeName(): string;

    setDescribeName(describeName: string): void;

    getClass(): Class;

    getClassInstance(): object;

    getHooksService(): IHooksService;

    getTestsService(): ITestsService;

    getImportsService(): IImportsService;

    getMocksService(): IMocksService;

    getTestRunner(): ITestRunner;

    setTestRunner(testRunner: ITestRunner): void;

    registerDescribeInJest(parentDescribeRunner?: IDescribeRunner): void;
}
