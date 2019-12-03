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

### [@Act](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md)

### [@ActAsync](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md)

### [@ComponentContainer](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/ComponentContainer.md)

### [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/ComponentProvider.md)

### [@DefaultProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultProps.md)

### [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithProps.md)

### [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithState.md)

## License

[MIT License](https://github.com/vitalishapovalov/jest-decorated/blob/master/LICENSE)
