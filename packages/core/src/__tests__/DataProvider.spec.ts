import { DataProvider, Describe, WithDataProvider, Test } from "../decorators";

@Describe()
class DataProviderSpec {

    @DataProvider()
    private dataProviderOne() {
        return [
            [1, 1, 2],
            [2, 2, 4],
        ];
    }

    @DataProvider()
    private dataProviderTwo = [
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 4, c: 6 },
    ];

    @DataProvider()
    private dataProviderThree = () => [
        [3, 3, 6],
        [2, 2, 4],
    ]

    @DataProvider()
    string() {
        return ["s", "b", "a"];
    }

    @DataProvider()
    promise() {
        return [
            new Promise(resolve => resolve(200)),
            new Promise(resolve => resolve(301)),
        ];
    }

    @Test(code => `${code} is a good response code`)
    @WithDataProvider("promise")
    first(code) {
        expect(code).toBeGreaterThanOrEqual(200);
    }

    @Test(str => `${str} is in "sba"`)
    @WithDataProvider("string")
    second(str) {
        expect("sba".indexOf(str)).toBeGreaterThan(-1);
    }

    @Test((providerName, [a, b, c]) => `${providerName}: ${a} + ${b} = ${c}`)
    @WithDataProvider(["dataProviderOne", "dataProviderThree"])
    third([a, b, c]) {
        expect(a + b).toEqual(c);
    }

    @Test()
    @WithDataProvider("dataProviderOne")
    testOne([a, b, c]) {
        expect(a + b).toEqual(c);
    }

    @Test()
    @WithDataProvider("dataProviderTwo")
    testTwo({ a, b, c }) {
        expect(a + b).toEqual(c);
        return {
            toEqual: [a + b, c],
            not: {
                toEqual: [a + b + c, c],
            },
        };
    }
}
