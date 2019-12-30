import { AutoCleared, Describe, Test } from "../decorators";

@Describe()
class AutoClearedSpec {

    @AutoCleared()
    ac1 = {
        foo: jest.fn(),
        bar: {
            deepFoo: jest.fn(),
        },
    };

    @AutoCleared()
    ac2 = {
        foo: jest.fn(),
        bar: {
            deepFoo: jest.fn(),
        },
    };

    @AutoCleared()
    ac3 = jest.fn();

    @Test()
    first() {
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
        this.ac1.foo();
    }

    @Test()
    second() {
        expect(this.ac1.foo).not.toHaveBeenCalled();
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
        this.ac3();
    }

    @Test()
    third() {
        expect(this.ac3).not.toHaveBeenCalled();
        expect(this.ac1.foo).not.toHaveBeenCalled();
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
    }
}
