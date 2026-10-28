export type UserRole = "SUPERADMIN" | "ENCARGADO" | "OPERADOR";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: "Superadministrador",
  ENCARGADO: "Encargado",
  OPERADOR: "Operador",
};

/** Active manager as returned by `GET /users` (`UserReadResponse`), reduced to what the UI needs. */
export type UserOption = { id: string; name: string };

export type UserReadResponse = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

/** Exact shape of UserReadResponse (GET/POST/PATCH /users) with a typed role. The password never travels here. */
export type PanelUser = Omit<UserReadResponse, "role"> & { role: UserRole };
