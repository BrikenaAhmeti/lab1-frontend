import type { ModuleKey } from './types';
import { normalizeRoles } from './lib/utils';

export type PermissionAction = 'VIEW' | 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTION';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';

export type AppModule =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'medicalRecords'
  | 'prescriptions'
  | 'rooms'
  | 'admissions'
  | 'invoices'
  | 'departments'
  | 'doctors'
  | 'nurses'
  | 'receptionists'
  | 'users';

export const permissions: Record<UserRole, Record<AppModule, PermissionAction[]>> = {
  ADMIN: {
    dashboard: ['VIEW', 'READ'],
    patients: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    appointments: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'ACTION'],
    medicalRecords: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    prescriptions: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    rooms: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'ACTION'],
    admissions: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'ACTION'],
    invoices: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'ACTION'],
    departments: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    doctors: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    nurses: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
    receptionists: ['VIEW', 'READ', 'CREATE', 'UPDATE'],
    users: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
  },
  DOCTOR: {
    dashboard: ['VIEW', 'READ'],
    patients: ['VIEW', 'READ'],
    appointments: ['VIEW', 'READ', 'UPDATE', 'ACTION'],
    medicalRecords: ['VIEW', 'READ', 'CREATE', 'UPDATE'],
    prescriptions: ['VIEW', 'READ', 'CREATE', 'UPDATE'],
    rooms: ['READ'],
    admissions: ['READ'],
    invoices: [],
    departments: [],
    doctors: [],
    nurses: [],
    receptionists: [],
    users: [],
  },
  NURSE: {
    dashboard: ['VIEW', 'READ'],
    patients: ['VIEW', 'READ'],
    appointments: ['VIEW', 'READ'],
    medicalRecords: ['VIEW', 'READ'],
    prescriptions: ['READ'],
    rooms: ['VIEW', 'READ'],
    admissions: ['VIEW', 'READ'],
    invoices: [],
    departments: [],
    doctors: [],
    nurses: [],
    receptionists: [],
    users: [],
  },
  RECEPTIONIST: {
    dashboard: ['VIEW', 'READ'],
    patients: ['VIEW', 'READ', 'CREATE', 'UPDATE'],
    appointments: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'ACTION'],
    medicalRecords: [],
    prescriptions: [],
    rooms: ['VIEW', 'READ'],
    admissions: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'ACTION'],
    invoices: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'ACTION'],
    departments: [],
    doctors: [],
    nurses: [],
    receptionists: [],
    users: [],
  },
};

export const moduleKeyToAppModule: Record<ModuleKey, AppModule> = {
  patients: 'patients',
  doctors: 'doctors',
  departments: 'departments',
  appointments: 'appointments',
  'medical-records': 'medicalRecords',
  prescriptions: 'prescriptions',
  rooms: 'rooms',
  admissions: 'admissions',
  invoices: 'invoices',
  nurses: 'nurses',
  receptionists: 'receptionists',
};

type HasPermissionArgs = {
  userRoles?: string[] | null;
  module: AppModule;
  action: PermissionAction;
};

export function getPermissionSet(userRoles?: string[] | null, module?: AppModule) {
  const allowedActions = new Set<PermissionAction>();

  normalizeRoles(userRoles ?? []).forEach((role) => {
    const rolePermissions = permissions[role as UserRole];

    if (!rolePermissions || !module) {
      return;
    }

    rolePermissions[module].forEach((action) => {
      allowedActions.add(action);
    });
  });

  return allowedActions;
}

export function hasPermission({ userRoles, module, action }: HasPermissionArgs) {
  return getPermissionSet(userRoles, module).has(action);
}

export function hasAnyPermission(userRoles: string[] | null | undefined, module: AppModule, actions: PermissionAction[]) {
  const permissionSet = getPermissionSet(userRoles, module);
  return actions.some((action) => permissionSet.has(action));
}

export function getModulePermissionFlags(userRoles: string[] | null | undefined, module: AppModule) {
  const permissionSet = getPermissionSet(userRoles, module);

  return {
    canView: permissionSet.has('VIEW'),
    canRead: permissionSet.has('READ'),
    canCreate: permissionSet.has('CREATE'),
    canUpdate: permissionSet.has('UPDATE'),
    canDelete: permissionSet.has('DELETE'),
    canAction: permissionSet.has('ACTION'),
    isReadOnly: permissionSet.has('READ') && !permissionSet.has('CREATE') && !permissionSet.has('UPDATE'),
  };
}
