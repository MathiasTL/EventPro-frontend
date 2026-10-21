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
