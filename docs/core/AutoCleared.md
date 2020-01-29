# @AutoCleared

Helper.

Useful, when you have difficult structure of mock object with deeply nested mock functions.

This decorator will `.mockClear()` every function inside your object `afterEach` test.

## Arguments

No arguments.

## Examples

### Common usage:

```javascript
@Describe()
class MyProcessorSpec {
    
    @AutoCleared()
    mockedObj = {
        nestedFn: jest.fn(),
        nestedObj: {
            deepNestedFn: jest.fn()
        }
    };
    
    @BeforeEach()
    createMyProcessor() {
        this.myProcessor = new MyProcessor(this.mockedObj);
    }
    
    @Test()
    shouldCallNestedFn() {
        this.myProcessor.process(); // nestedFn is called
        
        const { nestedFn, nestedObj: { deepNestedFn } } = this.mockedObj;
        expect(nestedFn).toHaveBeenCalledTimes(1);
        expect(deepNestedFn).not.toHaveNeenCalled();
    }
    
    @Test()
    shouldCallDeepNestedFn() {
        // all fn inside 'mockedObj' are '.mockClear()'ed
        
        this.myProcessor.processDeep(); // deepNestedFn is called
        
        const { nestedFn, nestedObj: { deepNestedFn } } = this.mockedObj;
        expect(nestedFn).not.toHaveNeenCalled();
        expect(deepNestedFn).toHaveBeenCalledTimes(1);
    }
}
```
