# @ComponentContainer

Helper. Creates auto-restored (after each test) container, which will become accessible inside class methods via `this.annotatedPropertyName`.

## Arguments

`containerTagName (keyof HTMLElementTagNameMap)?`: Optional. `div` by default.

## Examples

### Common usage:

From:

```typescript
let container = null;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("MySpec", () => {
    // ...
});
```

To:

```typescript
@Describe()
@RunWith(ReactTestRunner)
class MySpec {
    
    @ComponentContainer()
    container;
    
    // ...
}
```

### With `span` as a container:

From:

```typescript
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

describe("MySpec", () => {
    // ...
});
```

To:

```typescript
@Describe()
@RunWith(ReactTestRunner)
class MySpec {
    
    @ComponentContainer("span")
    container;
    
    // ...
}
```
