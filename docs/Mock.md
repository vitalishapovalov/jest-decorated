# @Mock, @AutoClearedMock

The same as `jest.doMock`.

Will register mocks right im the start of the `@Describe()` suite (before hooks or `@LazyImport`).

Will `jest.umock` module in `afterAll` hook.

`@AutoClearedMock` mock will be cleared after each test.

Mock will become accessible inside class methods via `this.annotatedPropertyName`.

## Arguments

`pathToMock (String)`: Path to the module, which will be mocked.

`mockImplementation (() => any)?`: Optional, otherwise - decorated method's implementation will be taken. 

`options (jest.MockOptions)?`: Optional. Jest mock options. If `mockImplementation` is skipped, can be passed as second argument.

## Examples

### Common usage

From:

```typescript
jest.mock("../module");

describe("MySpec", () => {
    
    afterAll(() => {
        jest.unmock("../module");
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @Mock("../module")
    myMock;
}
```

### Usage with implementation

From:

```typescript
jest.mock("../module", () => ({ myVal: "foo" }));

describe("MySpec", () => {
    // ...
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @Mock("../module", () => ({ myVal: "foo" }))
    myMock;
    
    // or
    
    @Mock("../module")
    myMock = () => ({ myVal: "foo" });
    
    // or
    
    @Mock("../module")
    myMock() {
        return { myVal: "foo" };
    }
}
```

### Usage with options

From:

```typescript
jest.mock("../module", () => ({ myVal: "foo" }), { virtual: true });

describe("MySpec", () => {
    // ...
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @Mock("../module", () => ({ myVal: "foo" }), { virtual: true })
    myMock;
    
    // or
    
    @Mock("../module", { virtual: true })
    myMock = () => ({ myVal: "foo" });
}
```

### AutoClearedMock

From:

```typescript
jest.mock("../module", () => ({
    myFn: jest.fn()
}));

import { myFn } from "../module";

describe("MySpec", () => {
    
    afterEach(() => {
        myFn.mockClear();
    });
    
    // ...
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @AutoClearedMock("../module")
    myMock = () => ({ myFn: jest.fn() });
}
```
