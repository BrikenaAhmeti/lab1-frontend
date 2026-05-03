function normalizeRole(role) {
    return role.trim().toUpperCase();
}
export function getUserRoles(roles = []) {
    const storedRole = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;
    return [...roles, ...(storedRole ? [storedRole] : [])].map(normalizeRole);
}
export function isAdminUser(roles = []) {
    const allRoles = getUserRoles(roles);
    return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}
