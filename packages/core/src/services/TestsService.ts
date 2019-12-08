import { isObject, isCallable } from "@js-utilities/typecheck";
import { ITestsService, OrderedMap, TestEntity, PreProcessor, PostProcessor, PreProcessorData } from "@jest-decorated/shared";

export class TestsService implements ITestsService {

    private static readonly NOT = "not" as const;

    private static readonly MATCHERS: readonly string[] = [
        "toBe",
        "toHaveBeenCalled",
        "toHaveBeenCalledTimes",
        "toHaveBeenCalledWith",
        "toHaveBeenLastCalledWith",
        "toHaveBeenNthCalledWith",
        "toHaveReturned",
        "toHaveReturnedTimes",
        "toHaveReturnedWith",
        "toHaveLastReturnedWith",
        "toHaveNthReturnedWith",
        "toHaveLength",
        "toHaveProperty",
        "toBeCloseTo",
        "toBeDefined",
        "toBeFalsy",
        "toBeGreaterThan",
        "toBeGreaterThanOrEqual",
        "toBeLessThan",
        "toBeLessThanOrEqual",
        "toBeInstanceOf",
        "toBeNull",
        "toBeTruthy",
        "toBeUndefined",
        "toBeNaN",
        "toContain",
        "toContainEqual",
        "toEqual",
        "toMatch",
        "toMatchObject",
        "toMatchSnapshot",
        "toMatchInlineSnapshot",
        "toStrictEqual",
        "toThrow",
        "toThrowErrorMatchingSnapshot",
        "toThrowErrorMatchingInlineSnapshot",
    ];

    private readonly preProcessors: OrderedMap<PreProcessor[]> = {};

    private readonly postProcessors: OrderedMap<PostProcessor[]> = [];

    private readonly tests: TestEntity[] = [];

    private readonly dataProviders: Map<PropertyKey, unknown[] | (() => unknown[])> = new Map();

    public constructor(private readonly clazzInstance: object) {
        this.registerPromisePreProcessor();
        this.registerExpectPostProcessor();
    }

    public mergeInDataProviders(testsService: ITestsService): void {
        for (const dataProvider of testsService.getDataProviders()) {
            this.registerDataProvider(dataProvider, () => testsService.getDataProvider(dataProvider));
        }
    }

    public registerTest(testEntity: TestEntity): void {
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

    private registerExpectPostProcessor(): void {
        this.registerPostProcessor(
            async (testResult: unknown) => {
                if (!isObject(testResult)) return;
                this.invokeMatchers(testResult);
            },
            1
        );
    }

    private invokeMatchers(testResult: object, not: boolean = false): void {
        for (const matcher of Object.keys(testResult)) {
            if (TestsService.NOT === matcher && isObject(testResult[matcher])) {
                this.invokeMatchers(testResult[matcher], true);
                continue;
            }
            if (!TestsService.MATCHERS.includes(matcher)) {
                continue;
            }
            const [expectVal, ...matcherValues] = testResult[matcher];
            const expectValue = not ? expect(expectVal).not : expect(expectVal);
            expectValue[matcher](...matcherValues);
        }
    }

    private async processAsync<T>(data: T, processors: OrderedMap<(PostProcessor | PreProcessor)[]>): Promise<T> {
        let dataResult = data;
        for (const processorOrder of Object.keys(processors)) {
            for (const processor of processors[processorOrder]) {
                dataResult = await processor.call(this.clazzInstance, dataResult);
            }
        }
        return dataResult;
    }
}
