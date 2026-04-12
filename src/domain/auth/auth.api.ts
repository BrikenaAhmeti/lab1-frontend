import { api } from '@/libs/axios/client';
import type {
  AssignUserRoleDTO,
  AuthRoleEntity,
  AuthTokensResponse,
  AuthUser,
  CreateRoleDTO,
  CreateUserDTO,
  LoginDTO,
  RefreshDTO,
  RegisterDTO,
  Tokens,
  UpdateRoleDTO,
  UpdateUserDTO,
  UserRefreshToken,
} from './types';

const BASE = '/auth';
const USERS_BASE = `${BASE}/users`;
const ROLES_BASE = `${BASE}/roles`;

export const AuthApi = {
  register: (payload: RegisterDTO) =>
    api.core.post<AuthTokensResponse>(`${BASE}/register`, payload).then((r) => r.data),

  login: (payload: LoginDTO) =>
    api.core.post<AuthTokensResponse>(`${BASE}/login`, payload).then((r) => r.data),

  refresh: (payload: RefreshDTO) =>
    api.core.post<AuthTokensResponse>(`${BASE}/refresh`, payload).then((r) => r.data),

  logout: (payload: RefreshDTO) =>
    api.core.post<void>(`${BASE}/logout`, payload).then(() => undefined),

  me: () => api.core.get<AuthUser>(`${BASE}/me`).then((r) => r.data),
};

export const AuthAdminApi = {
  listUsers: () => api.core.get<AuthUser[]>(USERS_BASE).then((r) => r.data),

  getUser: (id: string) => api.core.get<AuthUser>(`${USERS_BASE}/${id}`).then((r) => r.data),

  createUser: (payload: CreateUserDTO) =>
    api.core.post<AuthUser>(USERS_BASE, payload).then((r) => r.data),

  updateUser: (id: string, payload: UpdateUserDTO) =>
    api.core.put<AuthUser>(`${USERS_BASE}/${id}`, payload).then((r) => r.data),

  deleteUser: (id: string) => api.core.delete<void>(`${USERS_BASE}/${id}`).then(() => undefined),

  activateUser: (id: string) =>
    api.core.post<AuthUser>(`${USERS_BASE}/${id}/activate`).then((r) => r.data),

  deactivateUser: (id: string) =>
    api.core.post<AuthUser>(`${USERS_BASE}/${id}/deactivate`).then((r) => r.data),

  listRoles: () => api.core.get<AuthRoleEntity[]>(ROLES_BASE).then((r) => r.data),

  getRole: (id: string) => api.core.get<AuthRoleEntity>(`${ROLES_BASE}/${id}`).then((r) => r.data),

  createRole: (payload: CreateRoleDTO) =>
    api.core.post<AuthRoleEntity>(ROLES_BASE, payload).then((r) => r.data),

  updateRole: (id: string, payload: UpdateRoleDTO) =>
    api.core.put<AuthRoleEntity>(`${ROLES_BASE}/${id}`, payload).then((r) => r.data),

  deleteRole: (id: string) => api.core.delete<void>(`${ROLES_BASE}/${id}`).then(() => undefined),

  listUserRoles: (userId: string) =>
    api.core.get<string[]>(`${USERS_BASE}/${userId}/roles`).then((r) => r.data),

  assignUserRole: (userId: string, payload: AssignUserRoleDTO) =>
    api.core.post<string[]>(`${USERS_BASE}/${userId}/roles`, payload).then((r) => r.data),

  removeUserRole: (userId: string, role: string) =>
    api.core
      .delete<string[]>(`${USERS_BASE}/${userId}/roles/${encodeURIComponent(role)}`)
      .then((r) => r.data),

  listUserRefreshTokens: (userId: string) =>
    api.core.get<UserRefreshToken[]>(`${USERS_BASE}/${userId}/refresh-tokens`).then((r) => r.data),

  revokeUserRefreshToken: (userId: string, tokenId: string) =>
    api.core
      .post<void>(`${USERS_BASE}/${userId}/refresh-tokens/${tokenId}/revoke`)
      .then(() => undefined),

  revokeAllUserRefreshTokens: (userId: string) =>
    api.core.post<void>(`${USERS_BASE}/${userId}/refresh-tokens/revoke-all`).then(() => undefined),
};

export function tokensFromAuthResponse(payload: AuthTokensResponse): Tokens {
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}
