export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}
