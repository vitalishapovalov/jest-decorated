import { TestDecorator } from "./TestDecorator";

export type ExtendedTest = TestDecorator & {
    Only?: TestDecorator;
    Skip?: TestDecorator;
    Todo?: TestDecorator;
};
