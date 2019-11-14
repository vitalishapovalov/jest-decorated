export default class Test {

    public constructor(
        public readonly name: PropertyKey,
        public readonly description: string | ((...args: any[]) => string),
        public readonly dataProviders: PropertyKey[] = []
    ) {}

    public registerDataProvider(dataProvider: PropertyKey): void {
        this.dataProviders.push(dataProvider);
    }

    public registerDataProviders(dataProviders: PropertyKey[]): void {
        dataProviders.forEach(this.registerDataProvider.bind(this));
    }
}
