# @WithState

Used to provide specific state for any test.

Compatible only with wrappers, which provide `.setState()` method (like `enzyme`).

Test annotated with `@WithState` will start to receive the value passed to the decorator as a `state` field in props object:

```javascript
@Describe()
class MySpec {
  
  @Test()
  @WithState({ foo: "foo" })
  myTest(component, { props, state }) {
    // state.foo is available here
  }
}
```

## Arguments

`state (Object)`: State to set.

## NOT RECOMMENDED TO USE

According to the [react-testing-library](https://testing-library.com/docs/react-testing-library/faq):

_**Most of the damaging features have to do with encouraging testing implementation details. Primarily, these are shallow rendering, APIs which allow selecting rendered elements by component constructors, and APIs which allow you to get and interact with component instances (and their state/properties) (most of enzyme's wrapper APIs allow this).**_

_**The guiding principle for this library is:**_

`The more your tests resemble the way your software is used, the more confidence they can give you.` - 17 Feb 2018

_**Because users can't directly interact with your app's component instances, assert on their internal state or what components they render, or call their internal methods, doing those things in your tests reduce the confidence they're able to give you.**_

_**That's not to say that there's never a use case for doing those things, so they should be possible to accomplish, just not the default and natural way to test react components.**_

## Examples

### Common usage

From:

```javascript
import { shallow } from "enzyme";
import { MyComponent } from "../MyComponent";

describe("MyComponentSpec", () => {
    
    const shallowWithState = (state) => {
        const component = shallow(<MyComponent />);
        
        if (state) {
            return component.setState(state);
        }
        
        return component;
    };
    
    test("MyComponent should have '.red' when red is set", () => {
        const state = { red: true };
        const component = shallowWithState(state);
        
        expect(component.find(".red")).toHaveLength(1);
    })
});
```

To:

```javascript
import { shallow } from "enzyme";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {
    
    @ComponentProvider("../MyComponent")
    myComponent({ MyComponent }) {
        return shallow(<MyComponent />);
    }
    
    @Test("MyComponent should have '.red' when red is set")
    @WithState({ red: true })
    behaviourTest(component, { props, state }) {
        expect(component.find(".red")).toHaveLength(1);
    }
}
```
