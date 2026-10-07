export type ListResponse<T> = {
  items: T[];
  total: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
};
