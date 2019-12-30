import * as React from "react";
import { render } from "react-dom";

import { Describe, RunWith, MockFn, It } from "@jest-decorated/core";

import { ReactTestRunner } from "../runners";
import { Act, ComponentContainer, ComponentProvider } from "../decorators";

jest.useFakeTimers();

(global as any).fetch = async () => ({
    json: async () => ({}),
});

@Describe()
@RunWith(ReactTestRunner)
class ComponentContainerSpec {

    @MockFn()
    onSelect;

    @ComponentContainer("section")
    container;

    @Act()
    @ComponentProvider("./fixtures/components")
    cardComp({ Card }) {
        return render(<Card onSelect={this.onSelect} />, this.container);
    }

    @Act()
    advanceTimers(time: number) {
        jest.advanceTimersByTime(time);
    }

    @It("should select null after timing out")
    testOne() {
        expect(document.querySelectorAll("section")).toHaveLength(1);

        // move ahead in time by 100ms
        this.advanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();

        // and then move ahead by 5 seconds
        this.advanceTimers(5000);
        expect(this.onSelect).toHaveBeenCalledWith(null);
    }

    @It("should cleanup on being removed")
    testTwo() {
        this.advanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();

        // unmount the app
        render(null, this.container);

        this.advanceTimers(5000);
        expect(this.onSelect).not.toHaveBeenCalled();
    }

    @It("should accept selections")
    testThree() {
        this.container
            .querySelector(".alex2")
            .dispatchEvent(new MouseEvent("click", { bubbles: true }));

        this.advanceTimers(5000);

        expect(this.onSelect).toHaveBeenCalledWith(2);
    }
}
