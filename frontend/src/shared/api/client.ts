import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('vinyl_token');
}

export interface CoverUploadResult {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ detail: 'Request failed' }));
    const message =
      typeof error.detail === 'string'
        ? error.detail
        : error.detail?.[0]?.msg || 'Request failed';
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function uploadCoverImage(file: File): Promise<CoverUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 120000);

  try {
    return await apiRequest<CoverUploadResult>('/admin/uploads/cover', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La subida tardó demasiado. Reinicia el backend e inténtalo de nuevo.');
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export { API_URL };
