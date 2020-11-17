# @WithProps

Used to provide specific props for any test.

Will be merged (override values) with default props, and pass the combined object both to the `@ComponentProvider` method and method annotated `@WithProps`.

## Arguments

`props (Object)`: Props to render with.

## Examples

### Common usage

From:

```javascript
import { render } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const renderWithProps = (props = {}) => render(
        <MyComponent {...props} />
    );
    
    test("MyComponent calls onRender and onChange once during render", () => {
        const props = { onRender: jest.fn() };
        renderWithProps(props);
        
        expect(props.onRender).toHaveBeenCalledTimes(1);
    })
});
```

To:

```javascript
import { render } from "@testing-library/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent calls onRender and onChange once during render")
    @WithProps({ onRender: jest.fn() })
    behaviourTest({ getByText }, { props }) {
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with default props (set in `@ComponentProvider` or `@DefaultProps`):

See [here](react/DefaultProps.md).
