# Setup

## With jest `setupFilesAfterEnv`

You can register decorators once and use them everywhere, without importing! To achieve that, add `globals` files to `setupFilesAfterEnv` jest config.

For example, if we want to register `core` and `react` decorators globally:

```json
{
  "setupFilesAfterEnv": [
    "@jest-decorated/core/globals",
    "@jest-decorated/react/globals"
  ]
}
```

Or, if you already have single entry point for tests setup:

```json
{
  "setupFilesAfterEnv": [
    "<rootDir>/testSetup.ts"
  ]
}
```
```javascript
// testSetup.ts

import "@jest-decorated/core/globals";
import "@jest-decorated/react/globals";
```

## Importing `globals` file

Another option is to import `globals` files in each test separately:

```javascript
// myFn.spec.ts

import "@jest-decorated/core/globals";
import "@jest-decorated/react/globals";

@Describe()
@RunWith(ReactTestRunner)
class MyFnSpec {
  // ...
}
```

### Direct import

If solutions above doesn't serves your needs, you can use direct import:

```javascript
// myFn.spec.ts

import { Describe, RunWith } from "@jest-decorated/core";
import { ReactTestRunner } from "@jest-decorated/react";

@Describe()
@RunWith(ReactTestRunner)
class MyFnSpec {
  // ...
}
```
