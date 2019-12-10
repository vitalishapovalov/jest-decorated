import { TestType } from "@shared/types";

export class TestEntity {

    private testType: TestType;

    private readonly metadata: Map<PropertyKey, any> = new Map();

    public readonly dataProviders: PropertyKey[] = [];

    public constructor(
        public readonly name: PropertyKey,
        public readonly description: string | ((...args: unknown[]) => string),
        public readonly timeout?: number
    ) {}

    public registerDataProvider(dataProvider: PropertyKey): void {
        this.dataProviders.push(dataProvider);
    }

    public registerDataProviders(dataProviders: PropertyKey[]): void {
        dataProviders.forEach(this.registerDataProvider.bind(this));
    }

    public getMetadata<T = any>(key: PropertyKey): T {
        return this.metadata.get(key);
    }

    public setMetadata(key: PropertyKey, data: unknown): void {
        this.metadata.set(key, data);
    }

    public setTestType(testType: TestType): void {
        this.testType = testType;
    }

    public getTestType(): TestType {
        return this.testType;
    }
}
