# Decorators for writing jest-based tests for react components

Utilities for testing `react` components. Compatible with `enzyme`, `@testing-libray/react` and `react-dom/test-utils`.

Make sure to register `ReactTestRunner` on your parent test.

Jest test:

```javascript
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import MyComponent from "../MyComponent";

describe("MyComponentTest", () => {
    
    let container = null;
    
    beforeEach(() => {
      container = document.createElement("span");
      document.body.appendChild(container);
    });
    
    afterEach(() => {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    });
    
    const renderWithProps = (props = {}) => {
        act(() => {
           render(<MyComponent {...props} />, container); 
        });
    };
    
    it("turned on by default", () => {
        renderWithProps();
        
        const button = document.querySelector("[data-testid=toggle]");
        expect(button.innerHTML).toBe("Turn on");
    });
    
    it("changes value when clicked, calls onChange", () => {
        const passedProps = { onChange: jest.fn() };
        renderWithProps(passedProps);
        
        const button = document.querySelector("[data-testid=toggle]");
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(passedProps.onChange).toHaveBeenCalledTimes(1);
        expect(button.innerHTML).toBe("Turn off");
    });
});
```
 
Same test with `@jest-decorated`:

```javascript
import { render } from "react-dom/test-utils";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentTest {
    
    @ComponentContainer()
    container;
    
    @ComponentProvider("../MyComponent")
    provider(MyComponent, passedProps) {
        return render(<MyComponent {...passedProps} />, this.container);
    }
    
    @It("turned on by default")
    isTurnOn(component, passedPops) {
        const button = document.querySelector("[data-testid=toggle]");
        expect(button.innerHTML).toBe("Turn on");
    }
    
    @It("changes value when clicked, calls onChange")
    @WithProps({ onChange: jest.fn() })
    shouldToggle(component, passedPops) {
        const button = document.querySelector("[data-testid=toggle]");
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(passedPops.onChange).toHaveBeenCalledTimes(1);
        expect(button.innerHTML).toBe("Turn off");
    }
}
 ```

## Install & Setup

Read [here](../install.md).

## Contributing

[Contribution guidelines for this project](../contributing.md)

## License

[MIT License](../license.md)
