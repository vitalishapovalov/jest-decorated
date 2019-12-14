# @RunWith

Technical.

Used to run with `@jest-decorated` extensions.

## Arguments

`testRunnerConstructor ({ new(currentTestRunner: ITestRunner): ITestRunner;  })`: Extension's test runner constructor.

## Examples

### Usage with [React extension](https://github.com/vitalishapovalov/jest-decorated/blob/master/packages/react/README.md):

```typescript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentTest {
    // ...
}
```
