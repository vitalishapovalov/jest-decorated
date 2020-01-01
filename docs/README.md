# Decorators library for writing jest-based tests

Wrapper around [jest](https://jestjs.io/) JavaScript testing framework.

Provides decorators with some of core jest globals. Also, provides utilities to minimize boilerplate code and make tests code more consistent.

Jest test:

```javascript
describe("MyFnSpec", () => {
    
    const consoleLogSpy = jest.spyOn(console, "log");
    
    afterEach(() => {
        consoleLogSpy.mockClear();
    });
    
    afterAll(() => {
        consoleLogSpy.mockRestore();
    });
    
    test("shouldCallLogTwice", () => {
        myFn("foo");
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
    
    test("shouldCallLogOnce", () => {
        myFn("bar");
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
});
```

Same test with `@jest-decorated`:

```javascript
@Describe()
class MyFnSpec {
    
    @Spy(console, "log")
    consoleLogSpy;
    
    @Test()
    shouldCallLogTwice() {
        myFn("foo");
        expect(this.consoleLogSpy).toHaveBeenCalledTimes(2);
    }
    
    @Test()
    shouldCallLogOnce() {
        myFn("bar");
        expect(this.consoleLogSpy).toHaveBeenCalledTimes(1);
    }
}
```



## Extensions

Support for different libs and frameworks. Currently, only `React` is strongly supported.

### [React](react/index.md)

## Contributing

[Contribution guidelines for this project](contributing.md)

## License

[MIT License](license.md)
