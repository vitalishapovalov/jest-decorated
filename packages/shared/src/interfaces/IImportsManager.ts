import { LazyModule } from "../types";

export interface IImportsManager {

    registerLazyModule(lazyModule: LazyModule): void;

    registerLazyModulesInClass(): void;
}
