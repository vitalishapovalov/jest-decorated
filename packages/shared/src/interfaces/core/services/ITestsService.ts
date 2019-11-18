import { PostProcessor, PreProcessor, PreProcessorData } from "@shared/types";
import { TestEntity } from "@shared/entities";

export interface ITestsService {

    mergeInDataProviders(testsService: ITestsService): void;

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
