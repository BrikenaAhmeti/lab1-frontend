import { jsx as _jsx } from "react/jsx-runtime";
import ModulePage from '../ModulePage';
export function createModuleRoutePage(moduleKey) {
    function ModuleRoutePage() {
        return _jsx(ModulePage, { moduleKey: moduleKey });
    }
    ModuleRoutePage.displayName = `${moduleKey}RoutePage`;
    return ModuleRoutePage;
}
