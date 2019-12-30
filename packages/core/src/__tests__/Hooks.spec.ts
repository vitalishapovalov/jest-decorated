import { AfterAll, AfterEach, BeforeAll, BeforeEach, BeforeTest, Describe, It, Spy, Test } from "../decorators";

const fn = jest.fn();

@Describe("calls before all once")
class SpecOne {

    @BeforeAll()
    beforeAll() {
        fn();
    }

    @Test()
    first() {
        expect(fn).toHaveBeenCalledTimes(1);
    }

    @Test()
    second() {
        expect(fn).toHaveBeenCalledTimes(1);
    }

    @Test()
    third() {
        expect(fn).toHaveBeenCalledTimes(1);
    }
}

@Describe("calls before all once, and after all once")
class SpecTwo {

    @BeforeAll()
    beforeAll() {
        fn.mockClear();
    }

    @AfterAll()
    afterAll() {
        fn.mockClear();
    }

    @It()
    first() {
        expect(fn).not.toHaveBeenCalled();
    }

    @It()
    second() {
        expect(fn).not.toHaveBeenCalled();
    }

    @It()
    third() {
        expect(fn).not.toHaveBeenCalled();
        fn();
    }
}

@Describe("balls before each and after each correctly, combined hooks")
class SpecThree {

    i = 0;

    @AfterEach()
    afterEach() {
        fn.mockClear();
    }

    @AfterEach()
    @BeforeEach()
    beforeEach() {
        this.i = this.i + 1;
    }

    @Test()
    first() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(1);
    }

    @Test()
    second() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(3);
    }

    @Test()
    third() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(5);
    }
}

@Describe("inherits hooks")
class SpecFour extends SpecThree {

    @Test.todo("todo test")
    todo;

    i = 0;

    @Test()
    first() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(1);
    }

    @Test()
    second() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(3);
    }

    @Test()
    third() {
        expect(fn).not.toHaveBeenCalled();
        fn();
        expect(this.i).toBe(5);
    }
}

@Describe()
class BeforeTestSpec {

    static myObj = {
        foo: () => null,
    };

    @Spy(BeforeTestSpec.myObj, "foo", () => "foo")
    fooSpy;

    @Test()
    shouldBeFoo() {
        expect(BeforeTestSpec.myObj.foo()).toBe("foo");
    }

    @Test()
    @BeforeTest(inst => inst.fooSpy.mockImplementationOnce(() => "bar"))
    shouldBeBar() {
        expect(BeforeTestSpec.myObj.foo()).toBe("bar");
    }

    @Test()
    @BeforeTest(function () {
        this.fooSpy.mockImplementationOnce(() => "foobar");
    })
    shouldBeFoobar() {
        expect(BeforeTestSpec.myObj.foo()).toBe("foobar");
    }
}
