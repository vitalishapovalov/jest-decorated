# @Test, @It

The same as jest `test` and `it`.

Each class containing `@Test` and/or `@It` should be marked with [@Describe](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/core/Describe.md).

## Arguments

`testName (String | () => String)?`: Test name. Optional, otherwise - decorated method's name will be taken. 

`timeout (Number)?`: Optional. The timeout for an async function test. If `testName` is skipped, can be passed as first argument.

## Examples

### With method name as test name:

From:

```typescript
describe("MySpec", () => {
    
    test("shouldReturnFalse", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @Test()
    shouldReturnFalse() {
        expect(myFn()).toBeFalsy();
    }
}
```

### With test name passed as string argument:

From:

```typescript
describe("MySpec", () => {
    
    test("should return false", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @It("should return false")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
}
```

### Asynchronous test:

From:

```typescript
describe("MySpec", () => {
    
    test("should return false", async () => {
        expect(await myFn()).toBeFalsy();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @It("should return false")
    async myFnTest() {
        expect(await myFn()).toBeFalsy();
    }
}
```

### Asynchronous test with timeout:

From:

```typescript
describe("MySpec", () => {
    
    it("should return false within 500ms", async () => {
        expect(await myFn()).toBeFalsy();
    }, 500);
});
```

To:

```typescript
@Describe()
class MySpec {
   
    @It("should return false within 500ms", 500)
    async myFnTest() {
        expect(await myFn()).toBeFalsy();
    }
}
```

## only, skip, todo:

From:

```typescript
describe("MySpec", () => {
    
    test.todo("should not return false");
    
    test.skip("should return false", () => {
        expect(myFn()).toBeFalsy();
    });
    
    test.only("should return false", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```typescript
@Describe()
class MySpec {
    
    @Test.todo("should return false")
    todo;
    
    @It.skip("should return false")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
    
    @Test.only("should return false")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
}
```

## `@jest-decorated` specific

### With test name passed as function argument:

Could be useful with [@DataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/core/DataProvider.md)

```typescript
@Describe()
class MySpec {
    
    @Test(() => "should return false")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
}
```
