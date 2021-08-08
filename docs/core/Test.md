# @Test, @It

The same as jest `test` and `it`.

Each class containing `@Test` and/or `@It` should be marked with [@Describe](core/Describe.md).

## Arguments

`testName (String | () => String)?`: Test name. Optional, otherwise - decorated method's name will be taken. 

`timeout (Number)?`: Optional. The timeout for an async function test. If `testName` is skipped, can be passed as first argument.

## Examples

### With method name as a test name:

From:

```javascript
describe("MySpec", () => {
    
    test("shouldReturnFalse", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @Test()
    shouldReturnFalse() {
        expect(myFn()).toBeFalsy();
    }
}
```

### With test name passed as a string:

From:

```javascript
describe("MySpec", () => {
    
    it("should return false", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```javascript
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

```javascript
describe("MySpec", () => {
    
    it("should return false", async () => {
        expect(await myFn()).toBeFalsy();
    });
});
```

To:

```javascript
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

```javascript
describe("MySpec", () => {
    
    it("should return false within 500ms", async () => {
        expect(await myFn()).toBeFalsy();
    }, 500);
});
```

To:

```javascript
@Describe()
class MySpec {
   
    @It("should return false within 500ms", 500)
    async myFnTest() {
        expect(await myFn()).toBeFalsy();
    }
}
```

## only, skip, todo, concurrent:

From:

```javascript
describe("MySpec", () => {
    
    test.todo("should not return false");
    
    it.skip("should return false", () => {
        expect(myFn()).toBeFalsy();
    });
    
    test.only("should return false", () => {
        expect(myFn()).toBeFalsy();
    });

    test.concurrent("should be executed concurrently", () => {
        expect(myFn()).toBeFalsy();
    });
});
```

To:

```javascript
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

    @Test.concurrent("should be executed concurrently")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
}
```

## `@jest-decorated` specific

### With test name passed as a function:

Could be useful with [@DataProvider](core/DataProvider.md)

```javascript
@Describe()
class MySpec {
    
    @Test(() => "should return false")
    myFnTest() {
        expect(myFn()).toBeFalsy();
    }
}
```
