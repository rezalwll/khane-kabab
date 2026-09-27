export class ApiError extends Error {
  constructor(
    public readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (message = 'منبع درخواستی پیدا نشد.') =>
  new ApiError(404, 'NOT_FOUND', message);
