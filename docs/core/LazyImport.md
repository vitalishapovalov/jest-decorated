# @LazyImport

Helper.

All modules will be imported during test run, inside the `beforeAll` hook.

Mock will become accessible inside class methods via `this.{annotatedPropertyName}`.

## Arguments

`pathToModule (String)`: Absolute or relative path to the imported module.

`getter?: ((importedModule: any) => any) | string | string[]`: Optional. If you need to import only part of the module, or deeply-nested component. If not set - `default` export will be extracted, if it's the only export of imported module.

## Example

### Common usage, default extraction:

If your file has a single export, marked as default, it will be extracted by default (if no `getter` specified):

```javascript
// myModule.ts

export default () => {};
```

```javascript
@Describe()
class MySpec {
    
    @LazyImport("../myModule")
    myModule;
  
    // ...
}
```

### With getter:

```javascript
// myModule.ts

export const foo = () => {};
```

```javascript
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

```javascript
// myModule.ts

export const foo = {
    bar: "buzz"
};
```

```javascript
@Describe()
class MySpec {
    
    @LazyImport("../myModule", ["foo", "bar"])
    bar;
  
    // or
    
    @LazyImport("../myModule", importedModule => importedModule.foo.bar)
    bar;
}
```
