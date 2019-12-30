import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";

import { Describe, MockFn, RunWith, It } from "@jest-decorated/core";

import { ReactTestRunner } from "../runners";
import { Act, ActAsync, ComponentProvider } from "../decorators";

let container = null;
beforeEach(() => {
    container = document.createElement("span");
    document.body.appendChild(container);
});

afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
});

jest.useFakeTimers();

(global as any).fetch = async () => ({
    json: async () => ({}),
});

@Describe()
@RunWith(ReactTestRunner)
class ActSpec {

    @MockFn()
    onSelect;

    @Act()
    @ComponentProvider("./fixtures/components")
    toggleComp({ Card }) {
        return render(<Card onSelect={this.onSelect} />, container);
    }

    @Act()
    advanceTimers(time: number) {
        jest.advanceTimersByTime(time);
    }

    @ActAsync()
    async asyncAdvanceTimers(time: number) {
        jest.advanceTimersByTime(time);
    }

    @It("should select null after timing out")
    testOne() {
        // move ahead in time by 100ms
        this.advanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();

        // and then move ahead by 5 seconds
        this.advanceTimers(5000);
        expect(this.onSelect).toHaveBeenCalledWith(null);
    }

    @It("should cleanup on being removed")
    async testTwo() {
        await this.asyncAdvanceTimers(100);
        expect(this.onSelect).not.toHaveBeenCalled();

        // unmount the app
        render(null, container);

        await this.asyncAdvanceTimers(5000);
        expect(this.onSelect).not.toHaveBeenCalled();
    }

    @It("should accept selections")
    async testThree() {
        container
            .querySelector(".alex2")
            .dispatchEvent(new MouseEvent("click", { bubbles: true }));

        await this.asyncAdvanceTimers(5000);

        expect(this.onSelect).toHaveBeenCalledWith(2);
    }
}
