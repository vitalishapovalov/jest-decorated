import { TestEntity } from "../entities";

export type PreProcessorData = {
    clazzInstance: object;
    testEntity: TestEntity;
    args: any[];
};

export interface PreProcessor {
    (preProcessorData: PreProcessorData): Promise<PreProcessorData>;
}

export interface PostProcessor {
    (testResult: any): Promise<void>;
}
