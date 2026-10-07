export type Category = "SHOW" | "DJ" | "DECORATION" | "TENTS";
export type Resource = {
  id: string;
  name?: string;
  leader_name?: string;
  description?: string | null;
  service_category?: Category;
  is_active: boolean;
  base_price?: string | number;
  sale_price?: string | number;
  direct_cost?: string | number | null;
  duration_minutes?: number;
  total_stock?: number;
  phone?: string;
  compatible_themes?: Resource[];
  inventory_items?: { inventory_item_id: string; quantity: number; name?: string }[];
};
export type ResourceKind = "packages" | "themes" | "extras" | "inventory-items" | "crews";
