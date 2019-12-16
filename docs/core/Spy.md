# @Spy

The same as `jest.spyOn()`.

Will be cleared `afterEach` test.

Will be restored `afterAll` tests in suite.

Spy will become accessible inside class methods via `this.annotatedPropertyName`.

## Arguments

`object (Object)`: Object to spy on.

`property (String)`: Object's property name to spy on.

`accessType ("get" | "set")?`: If you want to spy on a getter or a setter, respectively.

`spyImplementation (() => any)?`: Optional, otherwise - decorated method's implementation will be taken. If no method implementation - spy implementation will not be overwritten.

## Examples

### Common usage:

From:

```javascript
describe("MySpec", () => {
    
    const consoleLogSpy = jest.spyOn(console, "log");
    
    afterEach(() => {
        consoleLogSpy.mockClear();
    });
    
    afterAll(() => {
        consoleLogSpy.mockRestore();
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
  
    @Spy(console, "log")
    consoleLogSpy;
    
    // ...
}
```

### Usage as getter/setter:

```javascript
describe("MySpec", () => {
    
    const consoleLogSpy = jest.spyOn(console, "log", "set");
    
    afterEach(() => {
        consoleLogSpy.mockClear();
    });
    
    afterAll(() => {
        consoleLogSpy.mockRestore();
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
  
    @Spy(console, "log", "set")
    consoleLogSpy;
    
    // ...
}
```

### Usage with implementation:

```javascript
describe("MySpec", () => {
    
    const consoleLogSpy = jest
        .spyOn(myObj, "foo")
        .mockImplementation(() => "bar")
        .mockName("consoleLogSpy");
    
    afterEach(() => {
        consoleLogSpy.mockClear();
    });
    
    afterAll(() => {
        consoleLogSpy.mockRestore();
    });
    
    // ...
});
```

To:

```javascript
@Describe()
class MySpec {
  
    @Spy(console, "log", () => "bar")
    consoleLogSpy;
    
    // or
    
    @Spy(console, "log")
    consoleLogSpy = () => "bar";
    
    // or
        
    @Spy(console, "log")
    consoleLogSpy() {
        return "bar";
    }
    
    // with get/set
    
    @Spy(console, "log", "get", () => "bar")
    consoleLogSpy;
}
```
