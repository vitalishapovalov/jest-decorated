import type { TestEntity } from "../entities";

export type PreProcessorData = {
    clazzInstance: object;
    testEntity: TestEntity;
    args: unknown[];
};

export type PreProcessor = (preProcessorData: PreProcessorData) => Promise<PreProcessorData>;

export type PostProcessor = (testResult: unknown, testError?: Error) => Promise<void>;
