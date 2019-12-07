export type LazyModule = {
    name: string;
    path: string;
    getter: ((importedModule: unknown) => any) | string | string[];
};
