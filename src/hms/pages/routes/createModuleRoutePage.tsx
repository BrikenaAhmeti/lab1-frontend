import ModulePage from '../ModulePage';
import type { ModuleKey } from '../../types';

export function createModuleRoutePage(moduleKey: ModuleKey) {
  function ModuleRoutePage() {
    return <ModulePage moduleKey={moduleKey} />;
  }

  ModuleRoutePage.displayName = `${moduleKey}RoutePage`;

  return ModuleRoutePage;
}
