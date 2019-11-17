import { PostProcessor, PreProcessor, PreProcessorData } from "../types";
import { TestEntity } from "../entities";

export interface ITestsManager {

    updateDataProviders(testsManager: ITestsManager): void;

    registerTest(testEntity: TestEntity): void;

    registerDataProvider(dataProviderName: PropertyKey, data: any[] | (() => any[])): void;

    getTest(testName: PropertyKey): TestEntity;

    getTests(): TestEntity[];

    getDataProvider(name: PropertyKey): any[];

    getDataProviders(): PropertyKey[];

    registerPreProcessor(preProcessor: PreProcessor): void;

    registerPostProcessor(postProcessor: PostProcessor): void;

    runPreProcessors(data: PreProcessorData): Promise<PreProcessorData>;

    runPostProcessors(testResult: any): Promise<void>;
}
