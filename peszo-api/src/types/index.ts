export interface JwtPayload {
  userId: string;
  email: string;
}

export interface RequestContext {
  requestId: string;
  userId?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
