# @Describe

The same as jest `describe`.

Each class marked with `@Describe` should contain at least one [@Test](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md) and/or [@It](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Test.md).

## Arguments

`describeName (String)?`: Describe name. Optional, otherwise - class name will be taken.

## Examples

### With class name as describe name

From:

```typescript
describe("MySpec", () => {
    // ...
});
```

To:

```typescript
@Describe()
class MySpec {
    // ...
}
```

### With describe name passed as argument

From:

```typescript
describe("Component spec", () => {
    // ...
});
```

To:

```typescript
@Describe("Component spec")
class MySpec {
    // ...
}
```

### Inherit @RunWith and all of the hooks (e.g. @BeforeAll), @MockFn, @Spy etc.

From:

```typescript
describe("Component spec", () => {
    
    // ...
    
    describe("MySpecSubSpec", () => {
        // ...
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    // ...
}

@Describe()
class MySpecSubSpec extends MySpec {
    // ...
}
```
