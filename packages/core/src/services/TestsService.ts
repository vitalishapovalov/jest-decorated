import { isCallable } from "@js-utilities/typecheck";
import { ITestsService, OrderedMap, TestEntity, PreProcessor, PostProcessor, PreProcessorData } from "@jest-decorated/shared";

export class TestsService implements ITestsService {

    private readonly preProcessors: OrderedMap<PreProcessor> = {};

    private readonly postProcessors: OrderedMap<PostProcessor> = {};

    private readonly tests: TestEntity[] = [];

    private readonly dataProviders: Map<PropertyKey, unknown[] | (() => unknown[])> = new Map();

    public constructor(private readonly clazzInstance: object) {
        this.registerPromisePreProcessor();
    }

    public mergeInDataProviders(testsService: ITestsService): void {
        for (const dataProvider of testsService.getDataProviders()) {
            this.registerDataProvider(dataProvider, () => testsService.getDataProvider(dataProvider));
        }
    }

    public registerTest(testEntity: TestEntity): void {
        if (this.tests.some(({ name }) => name === testEntity.name)) {
            this
                .getTest(testEntity.name)
                .mergeIn(testEntity);
            return;
        }
        this.tests.push(testEntity);
    }

    public registerDataProvider(dataProviderName: PropertyKey, data: () => unknown[]): void {
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
        const currPreProcessors = this.preProcessors[order] || [];
        currPreProcessors.push(preProcessor);
        this.preProcessors[order] = currPreProcessors;
    }

    public registerPostProcessor(postProcessor: PostProcessor, order: number): void {
        const currPostProcessors = this.postProcessors[order] || [];
        currPostProcessors.push(postProcessor);
        this.postProcessors[order] = currPostProcessors;
    }

    public runPreProcessors(data: PreProcessorData): Promise<PreProcessorData> {
        return this.processAsync(data, this.preProcessors);
    }

    public runPostProcessors(data: unknown): Promise<void> {
        return this.processAsync(data, this.postProcessors) as Promise<void>;
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
