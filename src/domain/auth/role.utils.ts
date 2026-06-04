function normalizeRole(role: string) {
  return role.trim().toUpperCase();
}

export function getUserRoles(roles: string[] = []) {
  return roles.map(normalizeRole);
}

export function hasAnyRole(roles: string[] = [], allowed: string[] = []) {
  const userRoles = getUserRoles(roles);
  const allowedRoles = allowed.map(normalizeRole);

  return userRoles.some((role) => allowedRoles.includes(role));
}

export function isAdminUser(roles: string[] = []) {
  return hasAnyRole(roles, ['ADMIN', 'ADMINS']);
}

export function isDoctorOrAdminUser(roles: string[] = []) {
  return hasAnyRole(roles, ['ADMIN', 'ADMINS', 'DOCTOR', 'DOCTORS']);
}
