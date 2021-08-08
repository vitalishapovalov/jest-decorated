import debug from "debug";

import { TestType } from "@shared/types";

export class TestEntity {

    private static readonly log = debug("jest-decorated:shared:TestEntity");

    public static createWithNameAndDataProviders(
        name: PropertyKey,
        dataProviders: PropertyKey[]
    ): TestEntity {
        const inst = new this(name, null, null);
        for (const dataProvider of dataProviders) {
            inst.registerDataProvider(dataProvider);
        }
        return inst;
    }

    private testType: TestType;

    private readonly metadata: Map<PropertyKey, any> = new Map();

    public readonly dataProviders: PropertyKey[] = [];

    public constructor(
        public readonly name: PropertyKey,
        public description: string | ((...args: unknown[]) => string),
        public timeout?: number
    ) {
        TestEntity.log(`New instance created. Name: ${String(name)}; description: ${description}; timeout: ${timeout}`);
    }

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

    public mergeIn(testEntity: TestEntity): this {
        if (testEntity.testType) {
            this.testType = testEntity.testType;
        }
        if (testEntity.metadata) {
            for (const [k, v] of testEntity.metadata) {
                this.metadata.set(k, v);
            }
        }
        if (testEntity.dataProviders?.length) {
            this.dataProviders.push(...testEntity.dataProviders);
        }
        if (testEntity.description) {
            this.description = testEntity.description;
        }
        if (testEntity.timeout) {
            this.timeout = testEntity.timeout;
        }
        return this;
    }

    public toString(): string {
        return `Test entity: name=${String(this.name)}; description=${this.description}; timeout=${this.timeout}; testType=${this.testType}; metadata=${JSON.stringify(this.metadata)}; dataProviders=${this.dataProviders}`;
    }
}
