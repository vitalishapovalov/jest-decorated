# @AfterAll, @AfterEach, @BeforeAll, @BeforeEach

The same as jest `afterAll`, `afterEach`, `beforeAll`, `beforeEach`.

## Arguments

No arguments.

## Examples

### Common usage

```typescript
@Describe()
class MySpec {
    
    @AfterEach()
    clearMocks() {
        jest.clearAllMocks();
    }
    
    // ...
}
```

### Multiple hooks

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
    
    // ...
}
```

### Combined hooks

```typescript
@Describe()
class MySpec {
    
    @BeforeAll()
    @AfterAll()
    clearMocks() {
        jest.clearAllMocks();
    }
    
    // ...
}
```

### Asynchronous hook

```typescript
@Describe()
class MySpec {
    
    @BeforeAll()
    async prepareModule() {
        await myModule.prepare();
    }
    
    // ...
}
```

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

### Inherit hooks

```typescript
@Describe()
class MySpec {
    
    @AfterEach()
    clearMocks() {
        jest.clearAllMocks();
    }
        
    // ...
}

@Describe()
class MySpecSubSpec extends MySpec {
    // @AfterEach inherited
}
```
