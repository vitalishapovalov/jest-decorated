export type ComponentContext = {
    contextType: React.Context<object>;
    value: object;
    lib: "react-dom" | "enzyme";
};
