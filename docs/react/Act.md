# @Act, @ActAsync

Wraps annotated method in `act` function of `react-dom/test-utils`.

`@ActAsync` is the same as act, except that it will be ran as `async` function.

## Arguments

No arguments.

## Examples

## Common usage:

From:

```javascript
describe("MyFnSpec", () => {
    
    beforeAll(() => {
       jest.useFakeTimers();
    });
    
    test("myTest", () => {
        runMyFn();
        
        act(() => {
          jest.advanceTimersByTime(100);
        });
        expect(onSelect).not.toHaveBeenCalled();
        
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        expect(onSelect).toHaveBeenCalledWith(null);
    });
});
```

To:

```javascript
@Describe()
class MyFnSpec {
  
    @BeforeAll()
    useFakeTimers() {
        jest.useFakeTimers();
    }
    
    @Act()
    advanceTimers(time) {
        jest.advanceTimersByTime(time);
    }
    
    @Test()
    myFn() {
        runMyFn();
        
        this.advanceTimers(100);
        expect(onSelect).not.toHaveBeenCalled();
        
        this.advanceTimers(5000);
        expect(onSelect).toHaveBeenCalledWith(null);
    }
}
```

### Async, `@ActAsync`:

From:

```javascript
describe("MyFnSpec", () => {
    
    test("myTest", async () => {
        runMyFn();
        
        await act(async () => {
          await doSomethingAsync(100);
        });
        expect(onSelect).not.toHaveBeenCalled();
    });
});
```

To:

```javascript
@Describe()
class MyFnSpec {
  
    @ActAsync()
    async doSomething(myVal) {
        await doSomethingAsync(myVal);
    }
    
    @Test()
    async myFn() {
        runMyFn();
        
        await this.doSomething(100);
        expect(onSelect).not.toHaveBeenCalled();
    }
}
```

### In pair with `@ComponentProvider`:

See [@ComponentProvider](react/ComponentProvider.md) examples section.
