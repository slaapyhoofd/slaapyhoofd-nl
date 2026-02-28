import { fetchAPI } from './api';
import { ApiResponse, AuthResponse, User } from '@/types/user';

export async function login(username: string, password: string): Promise<AuthResponse> {
  return fetchAPI<{ user: User; csrf_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<ApiResponse> {
  return fetchAPI('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: User; csrf_token: string }>> {
  return fetchAPI('/auth/me');
}
