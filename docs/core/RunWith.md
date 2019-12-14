# @RunWith

Technical.

Used to run with `@jest-decorated` extensions.

## Arguments

`testRunnerConstructor ({ new(currentTestRunner: ITestRunner): ITestRunner;  })`: Extension's test runner constructor.

## Examples

### Usage with [React extension](react/index.md):

```javascript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentTest {
    // ...
}
```
