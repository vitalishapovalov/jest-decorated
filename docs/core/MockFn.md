# @MockFn

The same as `jest.fn()`.

Also, Will be cleared after each test.

Mock function will become accessible inside class methods via `this.annotatedPropertyName`.

## Arguments

`mockImplementation (() => any)?`: Optional, otherwise - decorated method's implementation will be taken. 

## Examples

### Common usage:

From:

```javascript
describe("MySpec", () => {
    
    const myMock = jest.fn().mockName("myMock");
    
    afterEach(() => {
        myMock.mockClear();
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @MockFn()
    myMock;
    
    // ...
}
```

### Usage with implementation:

From:

```javascript
describe("MySpec", () => {
    
    const myMock = jest.fn(() => ({
        foo: "foo",
        bar: "bar"
    }));
    myMock.mockName("myMock");
    
    afterEach(() => {
        myMock.mockClear();
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
    
    @MockFn(() => ({
        foo: "foo",
        bar: "bar"
    }))
    myMock;
    
    // or
    
    @MockFn()
    myMock = () => ({
        foo: "foo",
        bar: "bar"
    });
    
    // or
    
    @MockFn()
    myMock() {
        return {
            foo: "foo",
            bar: "bar"
        };
    };
    
    // ...
}
```
