export class TestEntity {

    private readonly metadata: Map<PropertyKey, any> = new Map();

    public constructor(
        public readonly name: PropertyKey,
        public readonly description: string | ((...args: unknown[]) => string),
        public readonly timeout?: number,
        public readonly dataProviders: PropertyKey[] = []
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
}
