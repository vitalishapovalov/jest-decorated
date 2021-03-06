# @DefaultContext

Provides context for component in [@ComponentProvider](react/ComponentProvider.md).

Default means that context will be provided for each test, and merged with [@WithContext](react/WithContext.md), if available.

Can be [persistent](#persistent-context) or [clean for each test](#clean-context-for-each-test).

If method annotated with `@DefaultContext` exists in `@Describe`, each test will start to receive the return value of the annotated method as a `context` field in props object:

```javascript
@Describe()
class MySpec {
  
  @DefaultContext(MyContext)
  defaultContext() {
    return { foo: "foo" };
  }
  
  @Test()
  myTest(component, { props, context }) {
    // context.foo is available here
  }
}
```

WARN: [prop-types](https://www.npmjs.com/package/prop-types) lib needs to be installed, if you want to use `enzyme` lib.

## Arguments

`contextType (React.Context<any>)`: Type of the context.

`lib ("react-dom" | "enzyne")?`: Optional, `react-dom` by default. Type of the lib used to render component. For `@testing-library/react` - use `react-dom`.

## Examples

### Usage with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro):

From:

```javascript
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

```javascript
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
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent composes full name from first, last")
    behaviourTest({ getByText }, { context }) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Usage with [enzyme](https://airbnb.io/enzyme/):

From:

```javascript
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

```javascript
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
        return shallow(<MyComponent {...props} />);
    }
    
    @Test("MyComponent composes full name from first, last")
    behaviourTest({ getByText }, { context }) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Usage with [@WithContext](react/WithContext.md):

From:

```javascript
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

```javascript
import { render } from "@testing-library/react";
import MyContext from "../MyContext";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = { first: "Boba" };
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent {...props} />);
    }
    
    @Test("MyComponent composes full name from first, last")
    @WithContext({ last: "Fett" })
    behaviourTest({ getByText }, { context }) {
        expect(getByText(/^Received:/).textContent).toBe(`${context.first} ${context.last}`);
    }
}
```

### Persistent context:

If you have `jest.fn()` inside of your context, or any other values with own internal state, and you want to keep changes in this state during test suite, context value should be defined as an object

```javascript
@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @DefaultContext(MyContext)
    context = { onChange: jest.fn() };
    
    // ....
}
```

### Clean context for each test:

Opposite to the persistent context. To have a new instance of the context for each text, context value should be defined as a function:

```javascript
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
