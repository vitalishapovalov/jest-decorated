import type { PostProcessor, PreProcessor, PreProcessorData } from "@shared/types";
import type { TestEntity } from "@shared/entities";

export interface ITestsService {

    mergeInDataProviders(testsService: ITestsService): void;

    registerTest(testEntity: TestEntity): void;

    registerDataProvider(dataProviderName: PropertyKey, data: unknown[] | (() => unknown[])): void;

    getTest(testName: PropertyKey): TestEntity;

    getTests(): TestEntity[];

    getDataProvider(name: PropertyKey): unknown[];

    getDataProviders(): PropertyKey[];

    registerPreProcessor(preProcessor: PreProcessor, order: number): void;

    registerPostProcessor(postProcessor: PostProcessor, order: number): void;

    runPreProcessors(data: PreProcessorData): Promise<PreProcessorData>;

    runPostProcessors(preProcessorResult: unknown, testError?: Error): Promise<void>;
}
