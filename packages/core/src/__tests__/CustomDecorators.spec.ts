import { AfterAll, BeforeAll, BeforeEach, Describe, Test } from "../decorators";

import { RunOnPlatform } from "./fixtures/customDecorators";

const initialCounter = {
  win32: 0,
  darwin: 0,
};
const counter = { ...initialCounter };

@Describe()
class CustomDecoratorsSpec1 {

    @BeforeAll()
    @RunOnPlatform("darwin")
    darwinBeforeAll() {
        counter.darwin++;
    }

    @AfterAll()
    @RunOnPlatform("win32")
    winAfterAll() {
        counter.win32++;
    }

    @Test()
    @RunOnPlatform("darwin")
    darwinTest() {
        counter.darwin++;
    }

    @Test()
    @RunOnPlatform("win32")
    winTest() {
        counter.win32++;
    }

}

@Describe()
@RunOnPlatform("win32")
class CustomDecoratorsSpec2 {

    @BeforeEach()
    winBeforeEach() {
        counter.win32++;
    }

    @Test()
    winSuiteTest() {
        counter.win32++;
    }

}

@Describe()
@RunOnPlatform("darwin")
class CustomDecoratorsSpec3 {

    @BeforeEach()
    darwinBeforeEach() {
        counter.darwin++;
    }

    @Test()
    darwinSuiteTest() {
        counter.darwin++;
    }

}

@Describe()
class CustomDecoratorsSpec4 {

    @Test()
    finalTest() {
        if (process.platform !== "win32" && process.platform !== "darwin") {
            expect(counter).toStrictEqual(initialCounter);
        } else {
            expect(counter).toStrictEqual({
                ...initialCounter,
                [process.platform]: 4,
            });
        }
    }

}
