import { Describe, LazyImport, Test } from "../decorators";

@Describe()
class LazyImportSpec {

    @LazyImport("./fixtures/combinedOne")
    combinedOneDefault;

    @LazyImport("./fixtures/combinedOne", ["foo"])
    combinedOne;

    @LazyImport("./fixtures/combinedTwo", "bar")
    combinedTwo;

    @LazyImport("./fixtures/combinedThree", obj => obj.foo)
    combinedThree;

    @Test()
    first() {
        expect(this.combinedOneDefault.foo).toBe("moduleOne default");
        expect(this.combinedOneDefault.bar).toBe("moduleTwo default");

        expect(this.combinedOne).toBe("moduleOne default");

        expect(this.combinedTwo).toBe("moduleFour default");

        expect(this.combinedThree).toBe("moduleFive default");
    }
}
