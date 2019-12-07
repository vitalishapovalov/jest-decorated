import { TestEntity } from "../entities";

export type PreProcessorData = {
    clazzInstance: object;
    testEntity: TestEntity;
    args: unknown[];
};

export interface PreProcessor {
    (preProcessorData: PreProcessorData): Promise<PreProcessorData>;
}

export interface PostProcessor {
    (testResult: unknown): Promise<void>;
}
