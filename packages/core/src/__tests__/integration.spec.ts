import { AutoCleared, BeforeEach, Describe, LazyImport, Mock, Spy, Test } from "../decorators";

@Describe()
class MockAndLazyImportSpec {

    @Mock("./fixtures/moduleOne", () => ({
        default: "MOCKED_DEFAULT",
    }))
    moduleOne;

    @Mock("./fixtures/moduleTwo", {
        default: "MOCKED_DEFAULT_FACTORY",
    })
    moduleTwo;

    @LazyImport("./fixtures/combinedOne")
    combinedOne;

    @Test()
    first() {
        expect(this.combinedOne.foo).toMatchObject({
            default: "MOCKED_DEFAULT",
        });
        expect(this.combinedOne.bar).toMatchObject({
            default: "MOCKED_DEFAULT_FACTORY",
        });
    }
}

@Describe()
class MockAndLazyImportSpec2 {

    @Mock("./fixtures/moduleThree")
    moduleThree = () => ({
        default: "MOCKED_DEFAULT",
    });

    @Mock("./fixtures/moduleFour")
    moduleFour = {
        default: "MOCKED_DEFAULT_FACTORY",
    };

    @LazyImport("./fixtures/combinedTwo")
    combinedTwo;

    @Test()
    first() {
        expect(this.combinedTwo.foo).toMatchObject({
            default: "MOCKED_DEFAULT",
        });
        expect(this.combinedTwo.bar).toMatchObject({
            default: "MOCKED_DEFAULT_FACTORY",
        });
    }
}

@Describe()
class AutoClearedMockAndLazyImportSpec {

    @Spy(global, "isFinite")
    fetchSpy() {
        return false;
    }

    @Mock("./fixtures/moduleFive")
    moduleFive = {
        default: jest.fn().mockName("moduleFive"),
    };

    @AutoCleared()
    @Mock("./fixtures/moduleSix")
    moduleSix = {
        default: jest.fn().mockName("moduleSix"),
    };

    @LazyImport("./fixtures/combinedThree")
    combinedThree;

    @BeforeEach()
    hookTwo() {
        global.isFinite(1);
    }

    @Test()
    first() {
        expect(this.fetchSpy).toHaveBeenCalledTimes(1);

        expect(this.moduleFive.default).not.toHaveBeenCalled();
        this.moduleFive.default();

        console.log(this.combinedThree);

        expect(this.moduleSix.default).not.toHaveBeenCalled();

        this.combinedThree.foo.default();
        this.combinedThree.bar.default();

        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }

    @Test()
    second() {
        expect(this.fetchSpy).toHaveBeenCalledTimes(1);

        expect(this.moduleFive.default).toHaveBeenCalledTimes(2);
        this.moduleFive.default();

        expect(this.moduleSix.default).not.toHaveBeenCalled();

        this.combinedThree.foo.default();
        this.combinedThree.bar.default();

        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }

    @Test()
    third() {
        expect(this.fetchSpy).toHaveBeenCalledTimes(1);

        expect(this.moduleFive.default).toHaveBeenCalledTimes(4);

        expect(this.moduleSix.default).not.toHaveBeenCalled();

        this.combinedThree.foo.default();
        this.combinedThree.bar.default();

        expect(this.moduleSix.default).toHaveBeenCalledTimes(1);
    }
}
