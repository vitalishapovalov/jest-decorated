# @ComponentProvider

Bread-and-butter of the `React extension`. Used to provide component fo your tests.

You may have only one `@ComponentProvider` per describe.

If method annotated with `@ComponentProvider` exists in `@Describe`, each test will start to receive the return value of annotated method as a `first argument`, and props passed to the component as a `second argument`.

Will be executed for each test separately.

Can be combined with [@Act](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md), [@ActAsync](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md).

Works with [@DefaultContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultContext.md), [@DefaultProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultProps.md), [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithContext.md), [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithProps.md), [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithState.md).

Can lazy-import components. You can access all of the imports/mocks etc. inside the annotated method.

## Arguments

`pathToComponent (String)?`: Path to the component. If specified, component will be lazy-imported during suite, after all of the mocks/spies etc. If provided, annotated component will start to receive imported module as first argument.

`defaultProps?: (Object | (() => Object))`?: Optional, otherwise - empty object will be created. 

## Examples

### Usage with [enzyme](https://airbnb.io/enzyme/):

From:

```typescript jsx
import { shallow } from "enzyme";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    let myComponentShallow = () => shallow(<MyComponent />);
    
    it("shouldMatchSnapshot", () => {
        const myComponent = myComponentShallow();
        expect(myComponent).toMatchSnapshot();
    });
});
```

To:

```typescript jsx
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
    shouldMatchSnapshot(myComponent, props) {
        expect(myComponent).toMatchSnapshot();
    }
}
```

### Usage with [enzyme](https://airbnb.io/enzyme/) and component importing:

```typescript jsx
// ../MyComponent
//
// component has only default export

export default () => <div></div>;
```

From:

```typescript jsx
import { shallow } from "enzyme";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    let myComponentShallow = () => shallow(<MyComponent />);
    
    // ...
});
```

To:

```typescript jsx
import { shallow } from "enzyme";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, props) {
        return shallow(<MyComponent />);
    }
    
    // ...
}
```

### Usage with [react-dom](https://reactjs.org/docs/test-utils.html):

From:

```typescript jsx
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
    
    it("should have correct behaviour", () => {
        act(() => {
          render(<MyComponent />, container);
        });
        // ...
    });
});
```

To:

```typescript jsx
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
    behaviourTest(component, props) {
        // ...
    }
}
```

### Usage with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro):

```typescript jsx
// ../MyComponent

export const MyComponent = () => <div></div>;
```

From:

```typescript jsx
import { render } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    it("should have correct behaviour", () => {
        const { queryByTestId } = render(<MyComponent />);
        // ...
    });
});
```

To:

```typescript jsx
import { render } from "react-dom";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }, props) {
        return render(<MyComponent />);
    }
    
    @It("should have correct behaviour")
    behaviourTest({ queryByTestId }, props) {
        // ...
    }
}
```

### Usage with default props:

Also, you can provide default props with [@DefaultProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultProps.md).

From:

```typescript jsx
import { render } from "@testing-library/react";
import MyComponent from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const renderComponent = ({
        foo = "foo",
        bar = "bar"
    } = {}) => render(<MyComponent foo={foo} bar={bar} />);
    
    it("should have correct behaviour", () => {
        const { queryByTestId } = renderComponent(<MyComponent />);
        // ...
    });
});
```

To:

```typescript jsx
import { render } from "@testing-library/react";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    // Or, if used with import:
    // @ComponentProvider("../MyComponent", { foo: "foo", bar: "bar" })
    
    @ComponentProvider({ foo: "foo", bar: "bar" })
    myComponent(MyComponent, props) {
        return render(<MyComponent {...props} />);
    }
    
    @It("should have correct behaviour")
    behaviourTest({ queryByTestId }, props) {
        // ...
    }
}
```

### Usage with [@Act](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/Act.md):

If you're using pure `render` from `react-dom`, you probably need to annotate it with `@Act`:

```typescript jsx
import { render } from "react-dom";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentContainer()
    container;
    
    @Act()
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, props) {
        return render(<MyComponent {...props} />, this.container);
    }
    
    // or, if you need an async act:
    
    @AsyncAct()
    @ComponentProvider("../MyComponent")
    myComponent(MyComponent, props) {
        return render(<MyComponent {...props} />, this.container);
    }
}
```

### Providing context:

See [@DefaultContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/DefaultContext.md), [@WithContext](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithContext.md).

### Usage with specific props for each test:

See [@WithProps](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithProps.md).

### Usage with pre-set state:

Available only with [enzyme](https://airbnb.io/enzyme/). See [@WithState](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithState.md).
