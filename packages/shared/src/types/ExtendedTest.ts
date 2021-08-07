import type { TestDecorator } from "./TestDecorator";

export type ExtendedTest = TestDecorator & {
    only: TestDecorator;
    skip: TestDecorator;
    todo: TestDecorator;
};
