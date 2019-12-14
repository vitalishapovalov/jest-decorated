export type TestDecorator = (
    testNameOrTimeout?: string | ((...args: any[]) => string) | number,
    timeout?: number
) => (proto: object, methodName: PropertyKey) => void;
