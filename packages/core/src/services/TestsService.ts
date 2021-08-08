import type { ITestsService, OrderedMap, PreProcessor, PostProcessor, PreProcessorData } from "@jest-decorated/shared";
import debug from "debug";
import { TestEntity } from "@jest-decorated/shared";
import { isCallable } from "@js-utilities/typecheck";

export class TestsService implements ITestsService {

    private static readonly log = debug("jest-decorated:core:TestsService");

    private readonly preProcessors: OrderedMap<PreProcessor> = {};

    private readonly postProcessors: OrderedMap<PostProcessor> = {};

    private readonly tests: TestEntity[] = [];

    private readonly dataProviders: Map<PropertyKey, unknown[] | (() => unknown[])> = new Map();

    public constructor(private readonly clazzInstance: object) {
        TestsService.log("New instance crated");
        this.registerPromisePreProcessor();
    }

    public mergeInDataProviders(testsService: ITestsService): void {
        TestsService.log("Merging in data providers...");
        for (const dataProvider of testsService.getDataProviders()) {
            this.registerDataProvider(dataProvider, () => testsService.getDataProvider(dataProvider));
        }
        TestsService.log("Merging in data providers DONE");
    }

    public registerTest(testEntity: TestEntity): void {
        TestsService.log(`Registering test entity. TestEntity: ${String(TestEntity)}`);
        if (this.tests.some(({ name }) => name === testEntity.name)) {
            this
                .getTest(testEntity.name)
                .mergeIn(testEntity);
            return;
        }
        this.tests.push(testEntity);
    }

    public registerDataProvider(dataProviderName: PropertyKey, data: () => unknown[]): void {
        TestsService.log(`Registering data provider. Data provider name: ${String(dataProviderName)}`);
        this.dataProviders.set(dataProviderName, data);
    }

    public getTest(testName: PropertyKey): TestEntity {
        return this.tests.find(testEntity => testEntity.name === testName);
    }

    public getTests(): TestEntity[] {
        return [...this.tests];
    }

    public getDataProvider(name: PropertyKey): unknown[] {
        const data = this.dataProviders.get(name);
        return isCallable(data) ? data() : data;
    }

    public getDataProviders(): PropertyKey[] {
        return [...this.dataProviders.keys()];
    }

    public registerPreProcessor(preProcessor: PreProcessor, order: number): void {
        TestsService.log(`Registering pre-processor. Processor: ${String(preProcessor)}; Order: ${order}`);
        const currPreProcessors = this.preProcessors[order] || [];
        currPreProcessors.push(preProcessor);
        this.preProcessors[order] = currPreProcessors;
    }

    public registerPostProcessor(postProcessor: PostProcessor, order: number): void {
        TestsService.log(`Registering post-processor. Processor: ${String(postProcessor)}; Order: ${order}`);
        const currPostProcessors = this.postProcessors[order] || [];
        currPostProcessors.push(postProcessor);
        this.postProcessors[order] = currPostProcessors;
    }

    public runPreProcessors(data: PreProcessorData): Promise<PreProcessorData> {
        TestsService.log("Running pre-processors...");
        const result = this.processAsync(data, this.preProcessors);
        TestsService.log("Running pre-processors DONE");
        return result;
    }

    public runPostProcessors(data: unknown): Promise<void> {
        TestsService.log("Running post-processors...");
        const result = this.processAsync(data, this.postProcessors) as Promise<void>;
        TestsService.log("Running post-processors DONE");
        return result;
    }

    private registerPromisePreProcessor(): void {
        this.registerPreProcessor(
            async (data: PreProcessorData) => ({
                ...data,
                args: await Promise.all(data.args),
            } as PreProcessorData),
            1
        );
    }

    private async processAsync<T>(data: T, processors: OrderedMap<PostProcessor | PreProcessor>): Promise<T> {
        let dataResult = data;
        for (const processorOrder of Object.keys(processors).sort((a, b) => Number(a) - Number(b))) {
            for (const processor of processors[processorOrder]) {
                dataResult = await processor.call(this.clazzInstance, dataResult);
            }
        }
        return dataResult;
    }
}
