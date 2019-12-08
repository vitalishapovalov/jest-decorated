# Decorators for writing jest-based tests for react components

Extension of [@jest-decorated](https://github.com/vitalishapovalov/jest-decorated/blob/master/README.md) package.

Utilities for testing `react` components. Compatible with `enzyme`, `testing-libray` and `react-dom/test-utils`.

## Example usage

Make sure to register `ReactTestRunner` on your parent test:

```typescript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentTest {
    
    @ComponentContainer()
    container;
    
    @ComponentProvider()
    provider(passedProps) {
        return render(<MyComponent {...passedProps} />, this.container);
    }
    
    @It("changes value when clicked, calls onChange")
    @WithProps({ onChange: jest.fn() })
    shouldToggle(returnValueOfComponentProvider, passedPops) {
        const button = document.querySelector("[data-testid=toggle]");
        expect(button.innerHTML).toBe("Turn on");
    
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(passedPops.onChange).toHaveBeenCalledTimes(1);
        expect(button.innerHTML).toBe("Turn off");
    }
}
 ```

## Decorators

### [@Act](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md)

### [@ActAsync](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md)

### [@ComponentContainer](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/ComponentContainer.md)

### [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/ComponentProvider.md)

### [@DefaultContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultContext.md)

### [@DefaultProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultProps.md)

### [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithContext.md)

### [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithProps.md)

### [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithState.md)

## Contributing

[Contribution guidelines for this project](https://github.com/vitalishapovalov/jest-decorated/blob/master/CONTRIBUTING.md)

## License

[MIT License](https://github.com/vitalishapovalov/jest-decorated/blob/master/LICENSE)
