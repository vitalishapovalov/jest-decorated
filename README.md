# Decorators library for writing jest-based tests

Wrapper around [jest JavaScript testing framework](https://jestjs.io/).

Provides decorators with some of core jest globals. Also, provides utilities to minimize boilerplate code and make tests code more consistent.

Does not bring `jest` as a dependency, you should install the wanted version by yourself.

Jest test:

```typescript
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
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
});
```

Same test with `@jest-decorated`:

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

## Install

```bash
npm i -D @jest-decorated/core

# if used with react
npm i -D @jest-decorated/react
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

#### Jest core

### [@Describe](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Describe.md)

### [@Test](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md)

### [@It](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md)

### [@AfterAll](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Hooks.md)

### [@AfterEach](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Hooks.md)

### [@BeforeAll](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Hooks.md)

### [@BeforeEach](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Hooks.md)

### [@Mock](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Mock.md)

### [@AutoClearedMock](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Mock.md)

### [@MockFn](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/MockFn.md)

### [@Spy](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Spy.md)

#### Utilities

### [@AutoCleared](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/AutoCleared.md)

### [@DataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DataProvider.md)

### [@WithDataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithDataProvider.md)

### [@LazyImport](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/LazyImport.md)

#### Technical

### [@RunWith](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/RunWith.md)

## Contributing

[Contribution guidelines for this project](CONTRIBUTING.md)

## License

[MIT License](LICENSE)
