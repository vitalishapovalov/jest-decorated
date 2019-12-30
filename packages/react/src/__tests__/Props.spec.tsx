import * as React from "react";
import { shallow } from "enzyme";

import { Describe, RunWith, It } from "@jest-decorated/core";

import { ReactTestRunner } from "../runners";
import { ComponentProvider, DefaultProps, WithProps } from "../decorators";

@Describe()
@RunWith(ReactTestRunner)
class PropsSpec {

    @ComponentProvider("./fixtures/components")
    myComponent({ MyComponent }, { foo = 0, bar = 1 } = {}) {
        return shallow(
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
    testThree(myComponentShallow, { props }) {
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
        expect(myComponentShallow.children().text()).toBe(props.bar);
    }
}

@Describe()
@RunWith(ReactTestRunner)
class DynamicDefaultPropsSpec {

    @DefaultProps()
    defaultProps() {
        return {
            foo: 0,
            bar: 1,
            alex: jest.fn()
        };
    }

    @ComponentProvider("./fixtures/components")
    myComponent({ MyComponent }, props) {
        return shallow(<MyComponent {...props} />);
    }

    @It("should display bar")
    testThree(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(1);

        expect(myComponentShallow.find(".higher")).toHaveLength(0);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
        expect(myComponentShallow.children().text()).toBe(String(props.bar));
    }

    @It("should correctly render lower")
    @WithProps({ foo: -10 })
    async testOne(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(1);

        expect(myComponentShallow.find(".lower")).toHaveLength(1);
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
    }

    @It("should correctly render higher")
    @WithProps({ foo: 10 })
    testTwo(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(1);

        expect(myComponentShallow.find(".higher")).toHaveLength(1);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
    }
}

@Describe()
@RunWith(ReactTestRunner)
class PersistentDefaultPropsSpec {

    @DefaultProps()
    defaultProps = {
        foo: 0,
        bar: 1,
        alex: jest.fn()
    };

    @ComponentProvider("./fixtures/components")
    myComponent({ MyComponent }, props) {
        return shallow(<MyComponent {...props} />);
    }

    @It("should display bar")
    testThree(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(1);

        expect(myComponentShallow.find(".higher")).toHaveLength(0);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
        expect(myComponentShallow.children().text()).toBe(String(props.bar));
    }

    @It("should correctly render lower")
    @WithProps({ foo: -10 })
    async testOne(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(2);

        expect(myComponentShallow.find(".lower")).toHaveLength(1);
        expect(myComponentShallow.find(".higher")).toHaveLength(0);
    }

    @It("should correctly render higher")
    @WithProps({ foo: 10 })
    testTwo(myComponentShallow, { props }) {
        expect(props.alex).toHaveBeenCalledTimes(3);

        expect(myComponentShallow.find(".higher")).toHaveLength(1);
        expect(myComponentShallow.find(".lower")).toHaveLength(0);
    }
}
