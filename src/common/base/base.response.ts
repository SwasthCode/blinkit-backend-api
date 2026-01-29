export interface BaseResponse<T> {
  code: number;
  data: T | T[] | null;
  message: string;
  meta?: any;
  success: boolean;
}

export function successResponse<T>(
  data: T | T[] | null,
  message = 'Success',
  code = 200,
  meta: unknown = null,
): BaseResponse<T> {
  return {
    code,
    data,
    message,
    meta,
    success: true,
  };
}

export function errorResponse(
  message = 'Something went wrong',
  code = 400,
  meta: unknown = null,
): BaseResponse<null> {
  return {
    code,
    meta,
    data: null,
    message,
    success: false,
  };
}
