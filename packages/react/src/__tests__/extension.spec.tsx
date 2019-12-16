import * as React from "react";
import { render } from "react-dom";
import { shallow } from "enzyme";
import { render as rlRender } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import {
    Describe,
    RunWith,
    MockFn,
    Spy,
    AfterAll,
    AutoCleared,
    It,
    BeforeEach,
    BeforeAll,
    Test,
    LazyImport,
} from "@jest-decorated/core";

import {
    ComponentContainer,
    DefaultProps,
    Act,
    ComponentProvider,
    WithContext,
    WithState,
    WithProps,
    DefaultContext,
    ActAsync,
} from "../decorators";
import { ReactTestRunner } from "../runners";

import { myContext } from "./fixtures/contexts";

@Describe()
@RunWith(ReactTestRunner)
class MyComponentSpec {

    @Test.todo("refactor tests")
    refactoring;

    @LazyImport("enzyme", "shallow")
    protected shallow;

    @ComponentProvider("./fixtures/components")
    myComponent({ MyComponent }, { foo = 0, bar = 1 } = {}) {
        return this.shallow(
            <MyComponent foo={foo} bar={bar} />
        );
    }

    @It("should correctly render lower")
    @WithProps({ foo: -10 })
    async testOne(myComponentShallow) {
        expect(myComponentShallow.find(".lower")).toHaveLength(1);
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
    }

    @It("should correctly render higher")
    @WithProps({ foo: 10 })
    testTwo(myComponentShallow) {
        expect(myComponentShallow.find(".higher")).toHaveLength(1);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
    }

    @It("should display bar")
    @WithProps({ foo: 0, bar: "placeholder" })
    testThree(myComponentShallow, { bar }) {
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
        expect(myComponentShallow.children().text()).toBe(bar);
    }
}

@Describe()
class TestExtendsSpec extends MyComponentSpec {

    @ComponentProvider("./fixtures/components")
    myComponent({ MyComponent }, { foo = 0, bar = 1 } = {}) {
        return this.shallow(
            <MyComponent foo={foo} bar={bar} />
        );
    }

    @Test()
    first(myComponentShallow) {
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
    }
}

jest.useFakeTimers();

const j = {
    fn: () => "jack",
};

(global as any).fetch = async () => ({
    json: async () => ({}),
});

@Describe()
@RunWith(ReactTestRunner)
class CardSpec {

    @MockFn()
    onSelect;

    @Spy(j, "fn")
    spy() {
        return "alex";
    }

    @AfterAll()
    realTimers() {
        jest.useRealTimers();
    }

    @ComponentContainer()
    container;

    @DefaultProps()
    defaultProps() {
        return {
            onRender: jest.fn(),
        };
    }

    @Act()
    @ComponentProvider("./fixtures/components")
    toggleComp({ Card }, props: any = {}) {
        return render(<Card {...props} onSelect={props.onSelect || this.onSelect} />, this.container);
    }

    @Act()
    advanceTimers(time: number) {
        jest.advanceTimersByTime(time);
    }

    @It("should select null after timing out")
    testOne(cmp, { onRender }) {
        // move ahead in time by 100ms
        this.advanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenCalledTimes(1);

        // and then move ahead by 5 seconds
        this.advanceTimers(5000);
        expect(this.onSelect).toHaveBeenCalledWith(null);
    }

    @It("should cleanup on being removed")
    testTwo(cmp, { onRender }) {
        this.advanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenCalledTimes(1);

        // unmount the app
        render(null, this.container);

        this.advanceTimers(5000);
        expect(this.onSelect).not.toHaveBeenCalled();
    }

    @It("should accept selections")
    testThree(cmp, { onRender }) {
        this.container
            .querySelector(".alex2")
            .dispatchEvent(new MouseEvent("click", { bubbles: true }));

        this.advanceTimers(5000);

        expect(this.onSelect).toHaveBeenCalledWith(2);
        expect(onRender).toHaveBeenCalledTimes(2);
    }

    @It("spy impl test")
    testFour() {
        const res = j.fn();
        expect(this.spy).toHaveBeenCalledTimes(1);
        expect(res).toBe("alex");
    }
}

@Describe()
@RunWith(ReactTestRunner)
class UserSpec {

    static fakeUser = {
        name: "Joni Baez",
        age: "32",
        address: "123, Charming Avenue",
    };

    @Spy(global, "fetch")
    fetchSpy() {
        return Promise.resolve({
            json: () => Promise.resolve(UserSpec.fakeUser),
        });
    }

    @DefaultContext(myContext)
    defaultContext() {
        return {
            callMe: jest.fn(),
        };
    }

    @ActAsync()
    @ComponentProvider("./fixtures/components")
    async toggleComp({ User }, props: any = {}) {
        return rlRender(<User {...props} id={props.id || "123"} />);
    }

    @Test()
    @WithContext({ alex: 200 })
    testOne({ getByText }, props, { callMe, alex }) {
        expect(callMe).toHaveBeenCalledTimes(2);
        expect(alex).toBe(200);
        expect(getByText(UserSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(UserSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(UserSpec.fakeUser.age)).toBeInTheDocument();
    }

    @Test()
    @WithContext(myContext)
    @WithProps({ jack: 100 })
    testTwo({ getByText }, { jack }, { callMe, alex }) {
        expect(callMe).toHaveBeenCalledTimes(2);
        expect(alex).toBe(undefined);
        expect(jack).toBe(100);
        expect(getByText(UserSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(UserSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(UserSpec.fakeUser.age)).toBeInTheDocument();
    }
}

@Describe()
@RunWith(ReactTestRunner)
class AlexClassSpec {

    @Test.todo("should not go wrong")
    todo;

    @Spy(console, "log")
    logSpy;

    @BeforeEach()
    @BeforeAll()
    async mixedHook() {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("mixedHook");
    }

    @BeforeEach()
    hookTwo() {
        console.log("hookTwo");
    }

    @DefaultContext(myContext, "enzyme")
    defaultContext() {
        return {
            callMe: jest.fn(),
        };
    }

    @ComponentProvider("./fixtures/components")
    alexClass({ AlexClass }) {
        return shallow(<AlexClass />);
    }

    @AutoCleared()
    ac1 = {
        foo: jest.fn(),
        bar: {
            deepFoo: jest.fn(),
        },
    };

    @Test()
    @WithContext({ foo: 200 })
    testOne(shallowWrapper, props, { callMe, foo }) {
        expect(callMe).toHaveBeenCalledTimes(1);
        expect(foo).toBe(200);
        expect(shallowWrapper.find(".iamspan").length).toBe(1);
        expect(this.logSpy).toHaveBeenCalledTimes(3);

        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
        this.ac1.foo();
    }

    @Test()
    @WithState({ foo: "foo!" })
    testTwo(shallowWrapper, props, context, state) {
        expect(context.callMe).toHaveBeenCalledTimes(2);
        expect(shallowWrapper.find(".iamspan").length).toBe(1);
        expect(this.logSpy).toHaveBeenCalledTimes(2);
        expect(shallowWrapper.state("foo")).toBe(state.foo);

        expect(this.ac1.foo).not.toHaveBeenCalled();
        expect(this.ac1.bar.deepFoo).not.toHaveBeenCalled();
        this.ac1.bar.deepFoo();
        expect(this.ac1.bar.deepFoo).toHaveBeenCalledTimes(1);
    }
}
