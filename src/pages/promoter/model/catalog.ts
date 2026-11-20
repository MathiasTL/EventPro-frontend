export const PROMOTER_PACKAGES = [
  { name: "Hora Loca Básica", price: 450, group: "hora-loca" },
  { name: "Hora Loca Medium", price: 750, group: "hora-loca" },
  { name: "Hora Loca Premium", price: 1200, group: "hora-loca" },
  { name: "Combo Full Fiesta (Hora Loca + DJ)", price: 1300, group: "other" },
  { name: "Servicio de DJ y Luces Pro", price: 600, group: "other" },
  { name: "Show Infantil Divertido", price: 650, group: "other" },
  { name: "Paquete Baby Shower Especial", price: 550, group: "other" },
  { name: "Ambientación y Toldos Estándar", price: 900, group: "other" },
] as const;

export const PROMOTER_EXTRAS = [
  { name: "Bailarín / Animador", price: 150 },
  { name: "Cañón de confeti", price: 120 },
  { name: "Hora extra DJ", price: 150 },
  { name: "Muñeco Gorila Gigante", price: 250 },
  { name: "Robot LED con pistola de CO2", price: 350 },
] as const;

export function formatSoles(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}
