import RouteGuard from '../../components/RouteGuard';
import { moduleKeyToAppModule } from '../../permissions';
import ModulePage from '../ModulePage';
import type { ModuleKey } from '../../types';

export function createModuleRoutePage(moduleKey: ModuleKey) {
  function ModuleRoutePage() {
    return (
      <RouteGuard module={moduleKeyToAppModule[moduleKey]} action="VIEW">
        <ModulePage moduleKey={moduleKey} />
      </RouteGuard>
    );
  }

  ModuleRoutePage.displayName = `${moduleKey}RoutePage`;

  return ModuleRoutePage;
}
