export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export function apiSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function apiError(message: string, errors?: any): ApiResponse {
  return { success: false, message, errors };
}
