import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import * as authService from '@/services/auth';

vi.mock('@/services/auth');

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return auth context with user null initially', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: null },
    } as any);

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return AuthProvider({ children } as any) as any;
    };

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
    });

    expect(result.current.user).toBeNull();
  });

  it('should have login, logout, and checkAuth functions', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: null },
    } as any);

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return AuthProvider({ children } as any) as any;
    };

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
    });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.checkAuth).toBe('function');
  });

  it('should load current user on mount', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'editor' };

    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: mockUser },
    } as any);

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return AuthProvider({ children } as any) as any;
    };

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle getCurrentUser failure gracefully', async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(
      new Error('Network error')
    );

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return AuthProvider({ children } as any) as any;
    };

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
    });

    expect(result.current.user).toBeNull();
  });
});
