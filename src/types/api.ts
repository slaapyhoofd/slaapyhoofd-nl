export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
