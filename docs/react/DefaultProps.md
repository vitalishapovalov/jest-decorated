# @DefaultProps

Another approach to provide the default props for your [@ComponentProvider](react/ComponentProvider.md).

Props can be [persistent](#persistent-default-props) or [clean for each test](#clean-default-props-for-each-test).

## Arguments

No arguments.

## Examples

### Common usage:

From:

```javascript
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

```javascript
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
    behaviourTest({ getByText }, { props }) {
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with [@WithProps](react/WithProps.md):

When using with `@WithProps`, props from `@WithProps` decorator will be merged (and override) with props from the `@DefaultProps`:

From:

```javascript
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

```javascript
import { render } from "@testing-library/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultProps()
    defaultProps = () => ({
        onRender: jest.fn()
    });
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent calls onRender and onChange once during render")
    @WithProps({ onChange: jest.fn() })
    behaviourTest({ getByText }, { props }) {
        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Persistent default props:

If you have `jest.fn()` inside of your default props, or any other values with own internal state, and you want to keep changes in this state during test suite, default props should be defined as an object:

```javascript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultProps()
    defaultProps = { onChange: jest.fn() };
    
    // ....
}
```

### Clean default props for each test:

Opposite to persistent default props. To have a new instance of the default props for each text, default props value should be defined as a function:

```javascript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultProps()
    defaultProps = () => { onChange: jest.fn() };
    
    // or
    
    @DefaultProps()
    defaultProps() {
        return { onChange: jest.fn() };
    };
    
    // ....
}
```
