import type { DescribeDecorator } from "./DescribeDecorator";

export type ExtendedDescribe = DescribeDecorator & {
    only: DescribeDecorator;
    skip: DescribeDecorator;
};
