import * as React from "react";
import { shallow } from "enzyme";

import { Describe, RunWith, Test } from "@jest-decorated/core";

import { ReactTestRunner } from "../runners";
import { ComponentProvider, DefaultContext, WithState } from "../decorators";
import { myContext } from "./fixtures/contexts";

@Describe()
@RunWith(ReactTestRunner)
class AlexClassSpec {

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

    @Test()
    @WithState({ foo: "foo!" })
    testTwo(shallowWrapper, { context, state }) {
        expect(context.callMe).toHaveBeenCalledTimes(2);
        expect(shallowWrapper.find(".iamspan").length).toBe(1);
        expect(shallowWrapper.state("foo")).toBe(state.foo);
    }
}
