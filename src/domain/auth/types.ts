export type AuthRole = string;

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  emailConfirmed: boolean;
  isActive: boolean;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  roles: AuthRole[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: Tokens;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshDTO {
  refreshToken: string;
}

export interface AuthTokensResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  roles?: AuthRole[];
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  lockoutEnabled?: boolean;
}

export interface AuthRoleEntity {
  id?: string;
  name: string;
  normalizedName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDTO {
  name: string;
}

export interface UpdateRoleDTO {
  name: string;
}

export interface AssignUserRoleDTO {
  role: AuthRole;
}

export interface UserRefreshToken {
  id: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  isRevoked: boolean;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export function toAuthSession(payload: AuthTokensResponse): AuthSession {
  return {
    user: payload.user,
    tokens: {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    },
  };
}
