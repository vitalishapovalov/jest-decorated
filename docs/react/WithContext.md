# @WithContext

Provides context for component in [@ComponentProvider](react/ComponentProvider.md).

Will be merged (override values) with [@DefaultContext](react/DefaultContext.md), if available. 

Test annotated with `@WithContext` will start to receive the value passed to the decorator as a `context` field in props object:

```javascript
@Describe()
class MySpec {
  
  @Test()
  @WithContext(MyContext, { foo: "foo" })
  myTest(component, { props, context }) {
    // context.foo is available here
  }
}
```

WARN: [prop-types](https://www.npmjs.com/package/prop-types) lib needs to be installed, if you want to use `enzyme` lib.

## Arguments

`contextType (React.Context<any>)`: Type of the context.

`contextValue (Object)?`: Value passed to the context. Optional, if u have `@DefaultContext`.

`lib ("react-dom" | "enzyne")?`: Optional, `react-dom` by default. Type of the lib used to render component. For `@testing-library/react` - use `react-dom`.

## Examples

### Usage with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro):

From:

```javascript
import { render } from "@testing-library/react";
import MyContext from "../MyContext";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const renderWithDefaultContext = (context) => render(
        <MyContext.Provider {...context}>
          <MyContext.Consumer>
            {value => <MyComponent />}
          </MyContext.Consumer>
        </MyContext.Provider>
    );
    
    test("MyComponent calls onRender once during render", () => {
        const context = { onRender: jest.fn() };
        renderWithDefaultContext(context);
        expect(context.onRender).toHaveBeenCalledTimes(1);
    });
});
```

To:

```javascript
import { render } from "@testing-library/react";
import MyContext from "../MyContext";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent />);
    }
    
    @Test("MyComponent calls onRender once during render")
    @WithContext(MyContext, { onRender: jest.fn() })
    behaviourTest({ getByText }, { context }) {
        expect(context.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with [enzyme](https://airbnb.io/enzyme/):

From:

```javascript
import { shallow } from "enzyme";
import propTypes from "prop-types";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const shallowWithDefaultContext = (context) => {
        const component = <MyComponent />;
        component.type.contextTypes.first = propTypes.any;
        component.type.contextTypes.last = propTypes.any;
        component.type.contextTypes.onRender = propTypes.any;
        return shallow(component, {
            context
        });
    };
    
    test("MyComponent calls onRender once during render", () => {
        const context = { onRender: jest.fn() };
        renderWithDefaultContext(context);
        expect(context.onRender).toHaveBeenCalledTimes(1);
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
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return shallow(<MyComponent />);
    }
    
    @Test("MyComponent calls onRender once during render")
    @WithContext(MyContext, { onRender: jest.fn() })
    behaviourTest({ getByText }, { context }) {
       expect(context.onRender).toHaveBeenCalledTimes(1);
    }
}
```

### Usage with [@DefaultContext](react/DefaultContext.md):

See [@DefaultContext](react/DefaultContext.md).
