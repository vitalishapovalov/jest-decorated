# @DefaultContext

Provides context for component in [@ComponentProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/ComponentProvider.md).

Default means that context will be provided for each test, and merged with [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithContext.md), if needed.

Can be [persistent](#persistent-context:) or [clean for each test](#clean-context-for-each-test:).

If method annotated with `@DefaultContext` exists in `@Describe`, each test will start to receive the return value of annotated method as a `third argument`, after component itself and it's props.

WARN: [prop-types](https://www.npmjs.com/package/prop-types) lib needs to be installed, if you want to use `enzyme` lib.

## Arguments

`contextType (React.Context<any>)`: Type of the context.

`lib ("react-dom" | "enzyne")?`: Optional, `react-dom` by default. Type of the lib used to render component. For `@testing-library/react` - use `react-dom`.

## Examples

### Usage with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro):

From:

```typescript jsx
import { render } from "@testing-library/react";
import MyContext from "../MyContext";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const defaultContext = {
        first: "Boba",
        last: "Fett"
    };
    const renderWithDefaultContext = () => render(
        <MyContext.Provider {...defaultContext}>
          <MyContext.Consumer>
            {value => <MyComponent />}
          </MyContext.Consumer>
        </MyContext.Provider>
    );
    
    test("MyComponent composes full name from first, last", () => {
        const { getByText } = renderWithDefaultContext();
        const { first, last } = defaultContext;
        expect(getByText(/^Received:/).textContent).toBe(`${first} ${last}`);
    })
});
```

To:

```typescript jsx
import { render } from "@testing-library/react";
import MyContext from "../MyContext";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = {
        first: "Boba",
        last: "Fett"
    };
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent />);
    }
    
    @Test("MyComponent composes full name from first, last")
    behaviourTest({ getByText }, props, context) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Usage with [enzyme](https://airbnb.io/enzyme/):

From:

```typescript jsx
import { shallow } from "enzyme";
import propTypes from "prop-types";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const defaultContext = {
        first: "Boba",
        last: "Fett",
        onRender: jest.fn()
    };
    const shallowWithDefaultContext = () => {
        const component = <MyComponent />;
        component.type.contextTypes.first = propTypes.any;
        component.type.contextTypes.last = propTypes.any;
        component.type.contextTypes.onRender = propTypes.any;
        return shallow(component, {
            context: defaultContext
        }); 
    };
    
    test("MyComponent composes full name from first, last", () => {
        const { getByText } = renderWithDefaultContext();
        const { first, last, onRender } = defaultContext;
        expect(onRender).toHaveBeenCalledTimes(1);
        expect(getByText(/^Received:/).textContent).toBe(`${first} ${last}`);
    })
});
```

To:

```typescript jsx
import { shallow } from "enzyme";
import MyContext from "../MyContext";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext, "enzyme")
    context = () => ({
        first: "Boba",
        last: "Fett",
        onRender: jest.fn()
    });
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return shallow(<MyComponent />);
    }
    
    @Test("MyComponent composes full name from first, last")
    behaviourTest({ getByText }, props, context) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Usage with [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/react/WithContext.md):

From:

```typescript jsx
import { render } from "@testing-library/react";
import MyContext from "../MyContext";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const defaultContext = { first: "Boba" };
    const renderWithDefaultContext = (context) => render(
        <MyContext.Provider {...{...defaultContext, ...context}}>
          <MyContext.Consumer>
            {value => <MyComponent />}
          </MyContext.Consumer>
        </MyContext.Provider>
    );
    
    test("MyComponent composes full name from first, last", () => {
        const contextOverride = { last: "Fett" };
        const { getByText } = renderWithDefaultContext(contextOverride);
        expect(getByText(/^Received:/).textContent).toBe(`${defaultContext.first} ${contextOverride.last}`);
    })
});
```

To:

```typescript jsx
import { render } from "@testing-library/react";
import MyContext from "../MyContext";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = { first: "Boba" };
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent />);
    }
    
    @Test("MyComponent composes full name from first, last")
    @WithContext({ last: "Fett" })
    behaviourTest({ getByText }, props, context) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Persistent context:

If you have `jest.fn()` inside of your context, or any other values with state, and you want to keep changes in this state during tests, context value should be an object:

```typescript jsx
@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = { onChange: jest.fn() };
    
    // ....
}
```

### Clean context for each test:

Opposite to persistent context. To have a new instance of context for each text, context value should be a function:

```typescript jsx
@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = () => { onChange: jest.fn() };
    
    // or
    
    @DefaultContext(MyContext)
    context() {
        return { onChange: jest.fn() };
    };
    
    // ....
}
```
