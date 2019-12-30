# @Mock

The same as `jest.doMock()`.

Will register mocks right in the start of the `@Describe()` suite (before hooks or `@LazyImport`).

Will register `afterAll` hook and do `jest.umock` module inside.

Mock will become accessible inside class methods via `this.{annotatedPropertyName}`.

## Arguments

`pathToMock (String)`: Path to the module, which will be mocked.

`mockImplementation (Object | () => any)?`: Optional, otherwise - decorated method's implementation will be taken. 

`options (jest.MockOptions)?`: Optional. Jest mock options.

## Examples

### Common usage:

From:

```javascript
jest.doMock("../module");

describe("MySpec", () => {
    
    afterAll(() => {
        jest.unmock("../module");
    });
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @Mock("../module")
    myMock;
}
```

### Usage with implementation:

From:

```javascript
jest.doMock("../module", () => ({ myVal: "foo" }));

describe("MySpec", () => {
    
    afterAll(() => {
        jest.unmock("../module");
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @Mock("../module", () => ({ myVal: "foo" }))
    myMock;
    
    // or
    
    @Mock("../module", { myVal: "foo" })
    myMock;
    
    // or
    
    @Mock("../module")
    myMock = () => ({ myVal: "foo" });
    
    // or
    
    @Mock("../module")
    myMock = { myVal: "foo" };
    
    // or
    
    @Mock("../module")
    myMock() {
        return { myVal: "foo" };
    }
}
```

### Usage with options:

From:

```javascript
jest.doMock("../module", () => ({ myVal: "foo" }), { virtual: true });

describe("MySpec", () => {
    
    afterAll(() => {
        jest.unmock("../module");
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @Mock("../module", { virtual: true })
    myMock = { myVal: "foo" };
}
```

### With @AutoCleared:

If used with `@AutoCleared`, mock will be cleared `afterEach` test (will try to `.mockClear()` all of the `jest.fn()` inside mock, if it's an object, or just clear it, if it is as `jest.fn()`).

From:

```javascript
jest.doMock("../module", () => ({
    myFn: jest.fn()
}));

import { myFn } from "../module";

describe("MySpec", () => {
    
    afterEach(() => {
        myFn.mockClear();
    });
    
    afterAll(() => {
        jest.unmock("../module");
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @AutoCleared()
    @Mock("../module")
    myMock = { myFn: jest.fn() };
    
    // ...
}
```
