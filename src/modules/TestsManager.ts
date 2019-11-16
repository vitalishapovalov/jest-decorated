import { ITestsManager, TestEntity, PreProcessor, PostProcessor, PreProcessorData } from "@jest-decorated/shared";

export default class TestsManager implements ITestsManager {

    private readonly preProcessors: PreProcessor[] = [];

    private readonly postProcessors: PostProcessor[] = [];

    private readonly tests: TestEntity[] = [];

    private readonly dataProviders: Map<PropertyKey, any[]> = new Map();

    public constructor(private readonly clazzInstance: object) {
        this.registerPromisePreProcessor();
    }

    public registerTest(testEntity: TestEntity): void {
        this.tests.push(testEntity);
    }

    public registerDataProvider(dataProviderName: PropertyKey, data: any[]): void {
        this.dataProviders.set(dataProviderName, data);
    }

    public getTest(testName: PropertyKey): TestEntity {
        return this.tests.find(testEntity => testEntity.name === testName);
    }

    public getTests(): TestEntity[] {
        return [...this.tests];
    }

    public getDataProvider(name: PropertyKey): any[] {
        return this.dataProviders.get(name);
    }

    public getDataProviders(): Map<PropertyKey, any[]> {
        return new Map<PropertyKey, any[]>(this.dataProviders);
    }

    public registerPreProcessor(preProcessor: PreProcessor): void {
        this.preProcessors.push(preProcessor);
    }

    public registerPostProcessor(postProcessor: PostProcessor): void {
        this.postProcessors.push(postProcessor);
    }

    public runPreProcessors(data: PreProcessorData): Promise<PreProcessorData> {
        return this.processAsync(data, this.preProcessors);
    }

    public runPostProcessors(data: any): Promise<void> {
        return this.processAsync(data, this.postProcessors);
    }

    private registerPromisePreProcessor() {
        this.registerPreProcessor(async (data: PreProcessorData) => {
            const resolvedArguments: any[] = [];
            for await (const arg of data.args) {
                resolvedArguments.push(arg);
            }
            return { ...data, args: resolvedArguments } as PreProcessorData;
        });
    }

    private async processAsync<T = any>(data: T, processors: Function[]): Promise<T> {
        let dataResult: T = data;
        for (const preProcessor of processors) {
            dataResult = await preProcessor.call(this.clazzInstance, dataResult);
        }
        return dataResult;
    }
}
