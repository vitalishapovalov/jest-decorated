import Test from "./Test";

export default class TestsManager {

    private readonly tests: Test[] = [];

    private readonly dataProviders: Map<PropertyKey, any[]> = new Map();

    public constructor(private readonly clazzInstance: object) {}

    public registerTest(testEntity: Test): void {
        this.tests.push(testEntity);
    }

    public registerDataProvider(dataProviderName: PropertyKey, data: any[]) {
        this.dataProviders.set(dataProviderName, data);
    }

    public getTest(testName: PropertyKey): Test {
        return this.tests.find(testEntity => testEntity.name === testName);
    }

    public getTests(): Test[] {
        return [...this.tests];
    }

    public getDataProvider(name: PropertyKey): any[] {
        return this.dataProviders.get(name);
    }

    public getDataProviders(): Map<PropertyKey, any[]> {
        return new Map<PropertyKey, any[]>(this.dataProviders);
    }
}
