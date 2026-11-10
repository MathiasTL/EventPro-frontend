import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, TICK_MS);
  return () => clearInterval(timer);
}

// Snapshots are rounded to the tick so the value is stable between ticks (required by useSyncExternalStore).
const snapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;

/** Current time, refreshed every 30 s; used by the service-window countdown. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
