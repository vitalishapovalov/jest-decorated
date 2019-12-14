# @LazyImport

Helper.

All modules will be imported during test run, in `beforeAll` hook.

Mock will become accessible inside class methods via `this.annotatedPropertyName`.

## Arguments

`pathToModule (String)`: Absolute or related path to the module to import.

`getter?: ((importedModule: any) => any) | string | string[]`: Optional. If you need to import only part of the module, or deeply-nested component. If not set - `default` export will be extracted, if it's the only export of the module.

## Example

### Common usage, default extraction:

If your file has a single export, marked as default, it will be extracted by default (if no `getter` specified):

```typescript
// myModule.ts

export default () => {};
```

```typescript
@Describe()
class MySpec {
    
    @LazyImport("../myModule")
    myModule;
  
    // ...
}
```

### With getter:

```typescript
// myModule.ts

export const foo = () => {};
```

```typescript
@Describe()
class MySpec {
    
    @LazyImport("../myModule", "foo")
    foo;
  
    // or
    
    @LazyImport("../myModule", importedModule => importedModule.foo)
    foo;
}
```

### Nested values import:

```typescript
// myModule.ts

export const foo = {
    bar: "buzz"
};
```

```typescript
@Describe()
class MySpec {
    
    @LazyImport("../myModule", ["foo", "bar"])
    bar;
  
    // or
    
    @LazyImport("../myModule", importedModule => importedModule.foo.bar)
    bar;
}
```
