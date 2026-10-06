export type Role = "SUPERADMIN" | "ENCARGADO" | "OPERADOR";

export interface AuthUser {
  id: string;
  full_name: string;
  role: Role;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export type RefreshResponse = TokenPair;

export interface LoginResponse extends TokenPair {
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldError[];
}
