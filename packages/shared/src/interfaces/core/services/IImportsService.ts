import { LazyModule } from "@shared/types";

export interface IImportsService {

    registerLazyModule(lazyModule: LazyModule): void;

    registerLazyModulesInClass(): void;
}
