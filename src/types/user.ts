import { ApiResponse } from '@/types/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor';
  last_login: string | null;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    csrf_token: string;
  };
  error?: string;
}

export { ApiResponse };
