import RouteGuard from '@/app/routing/RouteGuard';
import { moduleKeyToAppModule } from '@/config/permissions';
import ModulePage from '../ModulePage';
import type { ModuleKey } from '@/types/app';

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
