# Decorators library for writing jest-based tests

Wrapper around [jest JavaScript testing framework](https://jestjs.io/). Provides decorators with core jest globals and other utilities to minimize boilerplate code.

```typescript
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

### [React](https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/react/README.md)

## Decorators

### [@Describe](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Describe.md)

### [@Test](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md)

### [@It](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md)

### [@AfterAll](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/AfterAll.md)

### [@AfterEach](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/AfterEach.md)

### [@BeforeAll](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/BeforeAll.md)

### [@BeforeEach](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/BeforeEach.md)

### [@Mock](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Mock.md)

### [@MockFn](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/MockFn.md)

### [@Spy](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Spy.md)

### [@DataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DataProvider.md)

### [@WithDataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithDataProvider.md)

### [@LazyImport](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/LazyImport.md)

### [@RunWith](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/RunWith.md)

## Contributing

[Contribution guidelines for this project](CONTRIBUTING.md)

## License

[MIT License](LICENSE)
