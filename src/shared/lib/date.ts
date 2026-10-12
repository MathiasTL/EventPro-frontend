const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Hoy" en hora de Lima, independiente de la zona horaria del navegador. */
export function limaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

export function addDays(value: string, amount: number): string {
  return formatDateOnly(new Date(parseDateOnly(value).getTime() + amount * DAY_MS));
}

/** Lunes de la semana calendario que contiene `value` (tratado como fecha pura, no instante). */
export function startOfWeek(value: string): string {
  const date = parseDateOnly(value);
  const weekday = date.getUTCDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  return addDays(value, diffToMonday);
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(parseDateOnly(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(parseDateOnly(value));
}
