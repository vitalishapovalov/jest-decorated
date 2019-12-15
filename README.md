# Decorators library for writing jest-based tests

[![Greenkeeper badge](https://badges.greenkeeper.io/vitalishapovalov/jest-decorated.svg)](https://greenkeeper.io/)

<p align="center"><img src="https://raw.githubusercontent.com/vitalishapovalov/jest-decorated/master/docs/logo.png" alt="@jest-decirated" width="300" /></p>

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm version](https://badge.fury.io/js/%40jest-decorated%2Fcore.svg)](https://badge.fury.io/js/%40jest-decorated%2Fcore)
![license](https://img.shields.io/github/license/vitalishapovalov/jest-decorated.svg)
[![Build Status](https://travis-ci.org/vitalishapovalov/jest-decorated.svg?branch=master)](https://travis-ci.org/vitalishapovalov/jest-decorated)

Wrapper around [jest](https://jestjs.io/) JavaScript testing framework.

Provides decorators with core jest globals. Also, provides utilities to minimize boilerplate code and make tests code more consistent.

[Read documentation.](https://vitalishapovalov.github.io/jest-decorated)

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

Does not bring `jest` as a dependency, you should install the wanted version by yourself.

Install `jest`

```bash
npm i -D jest
```

Install `@jest-decorated`

```bash
npm i -D @jest-decorated/core
```

Install extensions (if needed)

```bash
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

Support for different libs and frameworks. Currently, only [React](https://vitalishapovalov.github.io/jest-decorated/react) is strongly supported.

## Decorators

Read [docs](https://vitalishapovalov.github.io/jest-decorated).

## Contributing

[Contribution guidelines for this project](docs/contributing.md)

## License

[MIT License](LICENSE)
