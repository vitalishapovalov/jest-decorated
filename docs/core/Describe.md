# @Describe

The same as jest `describe`.

Each class marked with `@Describe` should contain at least one [@Test](core/Test.md) and/or [@It](core/Test.md).

## Arguments

`describeName (String)?`: Describe name. Optional, otherwise - class name will be taken.

## Examples

### With class name as a describe name:

From:

```javascript
describe("MySpec", () => {
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    // ...
}
```

### With describe name passed as an argument:

From:

```javascript
describe("Component spec", () => {
    // ...
});
```

To:

```javascript
@Describe("Component spec")
class MySpec {
    // ...
}
```

### Inherit @RunWith and all of the hooks (e.g. @BeforeAll), @MockFn, @Spy etc.:

From:

```javascript
describe("Component spec", () => {
    
    // ...
    
    describe("MySpecSubSpec", () => {
        // ...
    });
});
```

To:

```javascript
@Describe("Component spec")
class MySpec {
    // ...
}

@Describe()
class MySpecSubSpec extends MySpec {
    // ...
}
```
