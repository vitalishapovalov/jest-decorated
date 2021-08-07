export type ComponentContext = {
    contextType: import("react").Context<any>;
    value: object;
    lib: "react-dom" | "enzyme";
};
