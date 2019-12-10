# @AfterAll, @AfterEach, @BeforeAll, @BeforeEach

The same as jest `afterAll`, `afterEach`, `beforeAll`, `beforeEach`.

## Arguments

No arguments.

## Examples

### Common usage

From:

```typescript
describe("MySpec", () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @AfterEach()
    clearMocks() {
        jest.clearAllMocks();
    }
}
```

### Multiple hooks

From:

```typescript
describe("MySpec", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    afterAll(() => {
        jest.restoreAllMocks();
    });
    
    afterAll(() => {
        jest.useRealTimers();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @BeforeEach()
    clearMocks() {
        jest.clearAllMocks();
    }
    
    @AfterAll()
    restoreMocks() {
        jest.restoreAllMocks();
    }
    
    @AfterAll()
    restoreTimers() {
        jest.useRealTimers();
    }
}
```

### Combined hooks

From:

```typescript
describe("MySpec", () => {
    
    const clearMocks = () => jest.clearAllMocks();
    
    beforeAll(clearMocks);
    
    afterAll(clearMocks);
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @BeforeAll()
    @AfterAll()
    clearMocks() {
        jest.clearAllMocks();
    }
}
```

### Asynchronous hook

From:

```typescript
describe("MySpec", () => {
    
    beforeAll(async () => {
        await myModule.prepare();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @BeforeAll()
    async prepareModule() {
        await myModule.prepare();
    }
}
```

### Inherit hooks

From:

```typescript
describe("MySpec", () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe(() => {
        // @AfterEach inherited
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @AfterEach()
    clearMocks() {
        jest.clearAllMocks();
    }
}

@Describe()
class MySpecSubSpec extends MySpec {
    // @AfterEach inherited
}
```

## `@jest-decorated` specific

### Access @Spy / @MockFn / @Mock / @LazyImport and others inside hooks

```typescript
@Describe()
class MySpec {
    
    @LazyImport("../module")
    module;
    
    @AfterAll()
    doStuff() {
        this.module.doStuff();
    }
    
    // ...
}
```
