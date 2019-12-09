# Decorators library for writing jest-based tests

Wrapper around [jest JavaScript testing framework](https://jestjs.io/).

Provides decorators with core jest globals and other utilities to minimize boilerplate code and make tests code more consistent.

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

## Setup

### With `setupFilesAfterEnv` jest option

You can register decorators once and use them everywhere, without importing! To achieve that, add `globals` files to `setupFilesAfterEnv` jest config.

For example, if we want to register `core` and `react` decorators globally:

```json
{
  "setupFilesAfterEnv": [
    "@jest-decorated/core/globals",
    "@jest-decorated/react/globals"
  ]
}
```

Or, if you already have single entry point for tests setup:

```json
{
  "setupFilesAfterEnv": [
    "<rootDir>/testSetup.ts"
  ]
}
```
```typescript
// testSetup.ts

import "@jest-decorated/core/globals";
import "@jest-decorated/react/globals";
```

### With importing `globals` file

Another option is to import `globals` files in each test separately:

```typescript
// myFn.spec.ts

import "@jest-decorated/core/globals";
import "@jest-decorated/react/globals";

@Describe()
@RunWith(ReactTestRunner)
class MyFnSpec {
  // ...
}
```

### With direct import

If solutions above doesn't serves your needs, you can use direct import:

```typescript
// myFn.spec.ts

import { Describe, RunWith } from "@jest-decorated/core";
import { ReactTestRunner } from "@jest-decorated/react";

@Describe()
@RunWith(ReactTestRunner)
class MyFnSpec {
  // ...
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
