# @WithProps

Used to provide specific props for any test.

Will be merged and override default properties (if set), and passed both to `@ComponentProvider` and method annotated with `@WithProps`.

## Arguments

`props (Object)`: Props to set.

## Examples

### Common usage

From:

```typescript jsx
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

```typescript jsx
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
    behaviourTest({ getByText }, props) {
        expect(props.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with default props (set in `@ComponentProvider` or `@DefaultProps`):

See [here](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/DefaultProps.md).
