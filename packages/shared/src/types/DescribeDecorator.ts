import type { Class } from "./Class";

export type DescribeDecorator = (describeName?: string) => (clazz: Class) => void;
