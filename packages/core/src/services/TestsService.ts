import { isObject, isCallable } from "@js-utilities/typecheck";
import { ITestsService, TestEntity, PreProcessor, PostProcessor, PreProcessorData } from "@jest-decorated/shared";

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

    private readonly preProcessors: PreProcessor[] = [];

    private readonly postProcessors: PostProcessor[] = [];

    private readonly tests: TestEntity[] = [];

    private readonly dataProviders: Map<PropertyKey, any[] | (() => any[])> = new Map();

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

    public registerDataProvider(dataProviderName: PropertyKey, data: () => any[]): void {
        this.dataProviders.set(dataProviderName, data);
    }

    public getTest(testName: PropertyKey): TestEntity {
        return this.tests.find(testEntity => testEntity.name === testName);
    }

    public getTests(): TestEntity[] {
        return [...this.tests];
    }

    public getDataProvider(name: PropertyKey): any[] {
        const data = this.dataProviders.get(name);
        return isCallable(data) ? data() : data;
    }

    public getDataProviders(): PropertyKey[] {
        return [...this.dataProviders.keys()];
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

    private registerPromisePreProcessor(): void {
        this.registerPreProcessor(async (data: PreProcessorData) => ({
            ...data,
            args: await Promise.all(data.args),
        } as PreProcessorData));
    }

    private registerExpectPostProcessor(): void {
        this.registerPostProcessor(async (testResult: any) => {
            if (!isObject(testResult)) return;
            this.invokeMatchers(testResult);
        });
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

    private async processAsync<T = any>(data: T, processors: Function[]): Promise<T> {
        let dataResult: T = data;
        for (const processor of processors) {
            dataResult = await processor.call(this.clazzInstance, dataResult);
        }
        return dataResult;
    }
}
