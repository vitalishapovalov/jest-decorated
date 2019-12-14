# @AfterAll, @AfterEach, @BeforeAll, @BeforeEach

The same as jest `afterAll`, `afterEach`, `beforeAll`, `beforeEach`.

## Arguments

No arguments.

## Examples

### Common usage:

From:

```javascript
describe("MySpec", () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @AfterEach()
    clearMocks() {
        jest.clearAllMocks();
    }
}
```

### Multiple hooks:

From:

```javascript
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

```javascript
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

### Combined hooks:

From:

```javascript
describe("MySpec", () => {
    
    const clearMocks = () => jest.clearAllMocks();
    
    beforeAll(clearMocks);
    
    afterAll(clearMocks);
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @BeforeAll()
    @AfterAll()
    clearMocks() {
        jest.clearAllMocks();
    }
}
```

### Asynchronous hook:

From:

```javascript
describe("MySpec", () => {
    
    beforeAll(async () => {
        await myModule.prepare();
    });
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @BeforeAll()
    async prepareModule() {
        await myModule.prepare();
    }
}
```

### Inherit hooks:

From:

```javascript
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

```javascript
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

### Access @Spy / @MockFn / @Mock / @LazyImport and others inside hooks:

```javascript
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
