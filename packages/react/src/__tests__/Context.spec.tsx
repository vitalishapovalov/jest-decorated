import * as React from "react";
import { render as rlRender } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { Describe, RunWith, Spy, Test } from "@jest-decorated/core";

import { ReactTestRunner } from "../runners";
import { ActAsync, ComponentProvider, DefaultContext, WithContext, WithProps } from "../decorators";

import { myContext } from "./fixtures/contexts";

(global as any).fetch = async () => ({
    json: async () => ({}),
});

@Describe()
@RunWith(ReactTestRunner)
class DynamicContextSpec {

    static fakeUser = {
        name: "Joni Baez",
        age: "32",
        address: "123, Charming Avenue",
    };

    @Spy(global, "fetch")
    fetchSpy() {
        return Promise.resolve({
            json: () => Promise.resolve(DynamicContextSpec.fakeUser),
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
    testOne({ getByText }, { context }) {
        expect(context.callMe).toHaveBeenCalledTimes(2);
        expect(context.alex).toBe(200);
        expect(getByText(DynamicContextSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(DynamicContextSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(DynamicContextSpec.fakeUser.age)).toBeInTheDocument();
    }

    @Test()
    @WithContext(myContext)
    @WithProps({ jack: 100 })
    testTwo({ getByText }, { props: { jack }, context: { callMe, alex } }) {
        expect(callMe).toHaveBeenCalledTimes(2);
        expect(alex).toBe(undefined);
        expect(jack).toBe(100);
        expect(getByText(DynamicContextSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(DynamicContextSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(DynamicContextSpec.fakeUser.age)).toBeInTheDocument();
    }
}

@Describe()
@RunWith(ReactTestRunner)
class PersistentContextSpec {

    static fakeUser = {
        name: "Joni Baez",
        age: "32",
        address: "123, Charming Avenue",
    };

    @Spy(global, "fetch")
    fetchSpy() {
        return Promise.resolve({
            json: () => Promise.resolve(PersistentContextSpec.fakeUser),
        });
    }

    @DefaultContext(myContext)
    defaultContext = {
        callMe: jest.fn(),
    };

    @ActAsync()
    @ComponentProvider("./fixtures/components")
    async toggleComp({ User }, props: any = {}) {
        return rlRender(<User {...props} id={props.id || "123"} />);
    }

    @Test()
    @WithContext({ alex: 200 })
    testOne({ getByText }, { context }) {
        expect(context.callMe).toHaveBeenCalledTimes(2);
        expect(context.alex).toBe(200);
        expect(getByText(PersistentContextSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(PersistentContextSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(PersistentContextSpec.fakeUser.age)).toBeInTheDocument();
    }

    @Test()
    @WithContext(myContext)
    @WithProps({ jack: 100 })
    testTwo({ getByText }, { props: { jack }, context: { callMe, alex } }) {
        expect(callMe).toHaveBeenCalledTimes(4);
        expect(alex).toBe(undefined);
        expect(jack).toBe(100);
        expect(getByText(PersistentContextSpec.fakeUser.name)).toBeInTheDocument();
        expect(getByText(PersistentContextSpec.fakeUser.address)).toBeInTheDocument();
        expect(getByText(PersistentContextSpec.fakeUser.age)).toBeInTheDocument();
    }
}
