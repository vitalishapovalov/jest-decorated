# Decorators for writing jest-based tests for react components

Extension of [@jest-decorated](https://github.com/vitalishapovalov/jest-decorated/blob/master/README.md) package.

Utilities for testing `react` components. Compatible with `enzyme`, `@testing-libray/react` and `react-dom/test-utils`.

Make sure to register `ReactTestRunner` on your parent test.

Jest test:

```typescript jsx
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

```typescript jsx
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

Read [here](https://github.com/vitalishapovalov/jest-decorated/blob/master/README.md#install).

## Decorators

### [@Act](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/Act.md)

### [@ActAsync](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/Act.md)

### [@ComponentContainer](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/ComponentContainer.md)

### [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/ComponentProvider.md)

### [@DefaultContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/DefaultContext.md)

### [@DefaultProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/DefaultProps.md)

### [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithContext.md)

### [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithProps.md)

### [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithState.md)

## Contributing

[Contribution guidelines for this project](https://github.com/vitalishapovalov/jest-decorated/blob/master/CONTRIBUTING.md)

## License

[MIT License](https://github.com/vitalishapovalov/jest-decorated/blob/master/LICENSE)
