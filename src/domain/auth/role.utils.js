function normalizeRole(role) {
    return role.trim().toUpperCase();
}
export function getUserRoles(roles = []) {
    const storedRole = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;
    return [...roles, ...(storedRole ? [storedRole] : [])].map(normalizeRole);
}
export function hasAnyRole(roles = [], allowed = []) {
    const userRoles = getUserRoles(roles);
    const allowedRoles = allowed.map(normalizeRole);
    return userRoles.some((role) => allowedRoles.includes(role));
}
export function isAdminUser(roles = []) {
    return hasAnyRole(roles, ['ADMIN', 'ADMINS']);
}
export function isDoctorOrAdminUser(roles = []) {
    return hasAnyRole(roles, ['ADMIN', 'ADMINS', 'DOCTOR', 'DOCTORS']);
}
