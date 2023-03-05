export type Paginated<T> = {
  data: T[];
  pagination: {
    totalPages: number;
    pageSize: number;
    currentPage: number;
    totalItems: number;
  };
};

export class ApiError extends Error {
  public code: number;

  constructor(code: number, msg: string) {
    super(msg);
    this.code = code;
  }
}

export type ErrorResponse = {
  code: number;
  message: string;
};
