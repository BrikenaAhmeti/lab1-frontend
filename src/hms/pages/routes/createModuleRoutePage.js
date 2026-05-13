import { jsx as _jsx } from "react/jsx-runtime";
import RouteGuard from '../../components/RouteGuard';
import { moduleKeyToAppModule } from '../../permissions';
import ModulePage from '../ModulePage';
export function createModuleRoutePage(moduleKey) {
    function ModuleRoutePage() {
        return (_jsx(RouteGuard, { module: moduleKeyToAppModule[moduleKey], action: "VIEW", children: _jsx(ModulePage, { moduleKey: moduleKey }) }));
    }
    ModuleRoutePage.displayName = `${moduleKey}RoutePage`;
    return ModuleRoutePage;
}
