# @ComponentProvider

Bread-and-butter of the `React extension`. Used to provide component for your tests.

You may have only one `@ComponentProvider` per describe.

If the method annotated with `@ComponentProvider` exists in `@Describe`, each test will start to receive the return value of the annotated method as a `first argument`, and object with props, state and context passed to the component as a `second argument`.

Will be executed for each test separately (means that new instance of rendered component will be created for each test).

Can be combined with [@Act](react/Act.md), [@ActAsync](react/Act.md).

Works with [@DefaultContext](react/DefaultContext.md), [@DefaultProps](react/DefaultProps.md), [@WithContext](react/WithContext.md), [@WithProps](react/WithProps.md), [@WithState](react/WithState.md).

Can lazy-import components.

Also, you can access all of the imports/mocks etc. inside the annotated method.

## Arguments

`pathToComponent (String)?`: Path to the component. If specified, component will be lazy-imported during suite, after all of the mocks/spies etc. If provided, annotated method will start to receive the imported module as a first argument.

`defaultProps?: (Object | (() => Object))`?: Optional, otherwise - empty object will be created. Can't be combined with `@DefaultProps()`, you can have only one.

## Examples

### Usage with [enzyme](https://airbnb.io/enzyme/):

From:

```javascript
import { shallow } from "enzyme";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const myComponentShallow = () => shallow(<MyComponent />);
    
    it("shouldMatchSnapshot", () => {
        const myComponent = myComponentShallow();
        expect(myComponent).toMatchSnapshot();
    });
});
```

To:

```javascript
import { shallow } from "enzyme";
import MyComponent from "../MyComponent";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider()
    myComponent(props) {
        return shallow(<MyComponent />);
    }
    
    @It()
    shouldMatchSnapshot(myComponent, { props }) {
        expect(myComponent).toMatchSnapshot();
    }
}
```

### Usage with [enzyme](https://airbnb.io/enzyme/) and component importing:

```javascript
// ../MyComponent
//
// component has only default export

export default () => <div></div>;
```

From:

```javascript
import { shallow } from "enzyme";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const myComponentShallow = () => shallow(<MyComponent />);
    
    // ...
});
```

To:

```javascript
import { shallow } from "enzyme";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, { props }) {
        return shallow(<MyComponent />);
    }
    
    // ...
}
```

### Usage with [react-dom](https://reactjs.org/docs/test-utils.html):

From:

```javascript
import { render, unmountComponentAtNode } from "react-dom";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
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
    
    const renderComponent = () => {
        act(() => {
          render(<MyComponent />, container);
        });
    };
    
    it("should have correct behaviour", () => {
        renderComponent();
        // ...
    });
});
```

To:

```javascript
import { render } from "react-dom";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentContainer()
    container;
    
    @Act()
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, props) {
        return render(<MyComponent />, this.container);
    }
    
    @It("should have correct behaviour")
    behaviourTest(component, { props }) {
        // ...
    }
}
```

### Usage with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro):

```javascript
// ../MyComponent

export const MyComponent = () => <div></div>;
```

From:

```javascript
import { render } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const renderComponent = () => render(<MyComponent />);
    
    it("should have correct behaviour", () => {
        const { queryByTestId } = renderComponent();
        // ...
    });
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
        return render(<MyComponent />);
    }
    
    @It("should have correct behaviour")
    behaviourTest({ queryByTestId }, { props }) {
        // ...
    }
}
```

### Usage with default props:

Also, you can provide default props with [@DefaultProps](react/DefaultProps.md).

From:

```javascript
import { render } from "@testing-library/react";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const renderComponent = ({
        foo = "foo",
        bar = "bar"
    } = {}) => render(<MyComponent foo={foo} bar={bar} />);
    
    it("should have correct behaviour", () => {
        const { queryByTestId } = renderComponent();
        // ...
    });
});
```

To:

```javascript
import { render } from "@testing-library/react";
import MyComponent from "../MyComponent";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    // Or, if used with lazy-import:
    // @ComponentProvider("../MyComponent", { foo: "foo", bar: "bar" })
    
    @ComponentProvider({ foo: "foo", bar: "bar" })
    myComponent(props) {
        return render(<MyComponent {...props} />);
    }
    
    @It("should have correct behaviour")
    behaviourTest({ queryByTestId }, { props }) {
        // ...
    }
}
```

### Usage with [@Act](react/Act.md):

If you're using pure `render` from `react-dom`, you probably need to annotate it with `@Act`:

```javascript
import { render } from "react-dom";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentContainer()
    container;
    
    @Act() // or @ActAsync(), if you need an async act:
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, { props }) {
        return render(<MyComponent {...props} />, this.container);
    }
}
```

### Providing context:

See [@DefaultContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultContext.md), [@WithContext](react/WithContext.md).

### Usage with specific props for each test:

See [@WithProps](react/WithProps.md).

### Usage with pre-set state:

Available only with [enzyme](https://airbnb.io/enzyme/). See [@WithState](react/WithState.md).
