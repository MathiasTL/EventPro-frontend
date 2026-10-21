import { queryOptions } from "@tanstack/react-query";
import { listActiveManagers } from "./api";

export const userKeys = {
  managers: () => ["users", "managers", "active"] as const,
};

export const activeManagersOptions = () =>
  queryOptions({ queryKey: userKeys.managers(), queryFn: listActiveManagers, staleTime: 5 * 60_000 });
