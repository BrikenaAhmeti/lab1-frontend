function normalizeRole(role: string) {
  return role.trim().toUpperCase();
}

export function getUserRoles(roles: string[] = []) {
  const storedRole =
    typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;

  return [...roles, ...(storedRole ? [storedRole] : [])].map(normalizeRole);
}

export function isAdminUser(roles: string[] = []) {
  const allRoles = getUserRoles(roles);
  return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}
