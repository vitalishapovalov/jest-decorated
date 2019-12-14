import { TestEntity, TestType } from "../src";

describe("TestEntity", () => {

    const name = "name";
    const description = "description";
    const timeout = 100;
    const dataProviderName = "dataProvider";

    it("should createWithNameAndDataProviders", () => {
        const res = TestEntity.createWithNameAndDataProviders(name, [dataProviderName]);
        expect(res).toMatchObject({
            name,
            dataProviders: [dataProviderName]
        });
    });

    it("should merge in all", () => {
        const res = new TestEntity(name, description, timeout);
        res.registerDataProviders([dataProviderName]);
        res.setTestType(TestType.ONLY);
        res.setMetadata("foo", "bar");

        const emptyRes = new TestEntity(null, null, null);
        emptyRes.mergeIn(res);

        expect(res).toMatchObject({
            name,
            description,
            timeout,
            dataProviders: [dataProviderName]
        });
        expect(res.getTestType()).toEqual(TestType.ONLY);
        expect(res.getMetadata("foo")).toEqual("bar");
    });
});
