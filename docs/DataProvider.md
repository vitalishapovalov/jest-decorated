# @DataProvider

Helper. Used in a couple with [@WithDataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithDataProvider.md).

Ability to provide a source of data and use it only for specific tests annotated [@WithDataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithDataProvider.md).

## Arguments

`dataProviderName (String)?`: Optional. Otherwise - decorated property name will be taken.

## Return value

Annotated method must return an `Array`.

Tests annotated [@WithDataProvider](https://github.com/vitalishapovalov/jest-decorated/blob/master/docs/WithDataProvider.md) will be executed once for each entry in array.

## Examples

### Common usage:

`shouldAddNumbersTest` will be executed 2 times:

```typescript
@Describe()
class AddSpec {
    
    @DataProvider()
    numbers() {
        return [
            [2, 2, 4],
            [3, 3, 6]
        ];
    }
    
    @Test()
    @WithDataProvider("numbers")
    shouldAddNumbersTest([a, b, expected]) {
        expect(add(a, b)).toBe(expected);
    }
}
```

### With explicit name:

`hasAccessTest` will be executed 2 times:

```typescript
@Describe()
class HasAccessSpec {
    
    @DataProvider("of users with access")
    withAccess = ["user12", "user19", "user1"];
    
    @Test()
    @WithDataProvider("of users with access")
    hasAccessTest(user) {
        expect(hasAccess(user)).toBeTruthy();
    }
}
```

### Dynamic test name based on data provider:

`isPositiveTest` will be executed 3 times:

```typescript
@Describe()
class IsPositiveSpec {
    
    @DataProvider("of positive numbers")
    positiveNumbers = () => [1, 2, 3];
    
    @Test((number, dataProviderName) => `isPositive test for ${number}`)
    @WithDataProvider("of positive numbers")
    isPositiveTest(number) {
        expect(isPositive(number)).toBeTruthy();
    }
}
```

### Async data provider:

`myTest` will be executed 2 times:

```typescript
@Describe()
class MySpec {
    
  @DataProvider("of promises with codes")
  promise() {
      return [
        new Promise(resolve => resolve(200)),
        new Promise(resolve => resolve(301))
      ];
  }
  
  @Test()
  @WithDataProvider("of promises with codes")
  myTest(code) {
      expect(code).toBeGreaterThanOrEqual(200);
      expect(code).toBeLessThan(400);
  }
}
```

### Multiple data providers:

`isStringTest` will be executed 4 times:

```typescript
@Describe()
class MySpec {
    
  @DataProvider()
  stringsWithAlpha = [
    "Abc",
    "Foo"  
  ];
  
  @DataProvider()
  stringsWithNumbers = [
    "123",
    "1990"  
  ];
  
  @Test()
  @WithDataProvider(["stringsWithAlpha", "stringsWithNumbers"])
  isStringTest(str) {
      expect(isString(str)).toBeTruthy();
  }
}
```
