import { config } from '@/config';
import { ApiResponse } from '@/types/api';

// Module-level CSRF token — set after login/checkAuth, cleared on logout
let csrfToken = '';

export function setCsrfToken(token: string) {
  csrfToken = token;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const method = (options.method ?? 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach CSRF token for all mutating requests to admin endpoints
  if (MUTATING_METHODS.has(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Required for session cookies
    headers,
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (e.g. Apache error page, empty body)
    data = {
      success: false,
      error: `Server error ${response.status}: ${response.statusText}`,
      data: null,
    } as unknown as ApiResponse<T>;
  }
  return data;
}

export { fetchAPI };
