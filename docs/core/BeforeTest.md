# @BeforeTest

Helper.

Execute specific code before specific test.

Will be executed once, right before the test.

## Arguments

`fnToExecute ((describeClassInstance) => void)`: Function to execute.

## Examples

### Common usage:

For example, you want to override your spy value for a specific test:

```javascript
@Describe()
class MySpec {
  
  @Spy(myObj, "myFn", () => true)
  mySpy;
  
  @Test()
  foo() {
    expect(myObj.myFn()).toBeTruthy();
  }
  
  // change "mySpy" implementation for "bar" test
  
  @Test()
  @BeforeTest((classInstance) => {
    classInstance.mySpy.mockImplementationOnce(() => false);
  })
  bar() {
    expect(myObj.myFn()).toBeFalsy();
  }
  
  // or, with 'function'
  
  @Test()
  @BeforeTest(function () {
    this.mySpy.mockImplementationOnce(() => false);
  })
  bar() {
    expect(myObj.myFn()).toBeFalsy();
  }
}
```
