# Decorators for writing jest-based tests for react components

Utilities for testing `react` with `enzyme` library. Make sure to register `ReactTestRunner` on your parent test:

```typescript
import { Describe, RunWith } from "@jest-decorated/core";
import { ReactTestRunner } from "@jest-decorated/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentTest {
    // ...
}
 ```

## Decorators

### [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/ComponentProvider.md)

### [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithProps.md)

### [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithState.md)

## License

[MIT License](https://github.com/vitalishapovalov/jest-decorated/blob/master/LICENSE)
