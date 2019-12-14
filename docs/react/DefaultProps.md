# @DefaultProps

Another approach to provide default props for your [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/ComponentProvider.md).

## Arguments

No arguments.

## Examples

### Common usage:

From:

```typescript jsx
import { render } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const defaultProps = {
        onRender: jest.fn()
    };
    const renderWithDefaultProps = () => render(
        <MyComponent {...defaultProps} />
    );
    
    afterEach(() => {
        defaultProps.onRender.mockClear();
    });
    
    test("MyComponent calls onRender once during render", () => {
        renderWithDefaultProps();
        
        expect(defaultProps.onRender).toHaveBeenCalledTimes(1);
    })
});
```

To:

```typescript jsx
import { render } from "@testing-library/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultProps()
    defaultProps = {
        onRender: jest.fn()
    };
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent calls onRender once during render")
    behaviourTest({ getByText }, props) {
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithProps.md):

When using with `@WithProps`, props from `@WithProps` will override props from the `@DefaultProps`:

From:

```typescript jsx
import { render } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const defaultProps = {
        onRender: jest.fn()
    };
    const renderWithDefaultProps = (propsToOverride = {}) => render(
        <MyComponent {...{ ...defaultProps, ...propsToOverride }} />
    );
    
    afterEach(() => {
        defaultProps.onRender.mockClear();
    });
    
    test("MyComponent calls onRender and onChange once during render", () => {
        const propsToOverride = { onChange: jest.fn() };
        renderWithDefaultProps(propsToOverride);
        
        expect(propsToOverride.onChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onRender).toHaveBeenCalledTimes(1);
    })
});
```

To:

```typescript jsx
import { render } from "@testing-library/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultProps()
    defaultProps = {
        onRender: jest.fn()
    };
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent calls onRender and onChange once during render")
    @WithProps({ onChange: jest.fn() })
    behaviourTest({ getByText }, props) {
        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```
