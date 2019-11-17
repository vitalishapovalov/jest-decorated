import { Class } from "../types";
import { IHooksManager } from "./IHooksManager";
import { ITestsManager } from "./ITestsManager";
import { ITestRunner } from "./ITestRunner";
import { IImportsManager } from "./IImportsManager";
import { IMocksManager } from "./IMocksManager";

export interface IDescribeManager {

    getDescribeName(): string;

    setDescribeName(describeName: string): void;

    getClass(): Class;

    getClassInstance(): object;

    getHooksManager(): IHooksManager;

    getTestsManager(): ITestsManager;

    getTestRunner(): ITestRunner;

    getImportsManager(): IImportsManager;

    getMocksManager(): IMocksManager;

    setTestRunner(testRunner: ITestRunner): void;

    registerDescribeInJest(parentDescribeManager?: IDescribeManager): void;
}
