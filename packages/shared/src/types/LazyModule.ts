export type LazyModule = {
    name: string;
    path: string;
    getter: ((importedModule: any) => any) | string | string[];
};
