export type UserRole = "SUPERADMIN" | "ENCARGADO" | "OPERADOR";

/** Forma exacta de UserReadResponse (GET/POST/PATCH /users). La contraseña nunca viaja aquí. */
export type PanelUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};
