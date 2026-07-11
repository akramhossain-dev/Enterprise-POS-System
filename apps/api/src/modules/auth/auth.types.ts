export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
  };
}
