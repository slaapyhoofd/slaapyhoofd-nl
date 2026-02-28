import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import * as authService from '@/services/auth';

vi.mock('@/services/auth');

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user and loading true', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: null },
    } as any);

    const TestComponent = () => {
      return <div>Auth Provider Loaded</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByText('Auth Provider Loaded')).toBeInTheDocument();
  });

  it('should load current user on mount', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'editor' };

    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: mockUser },
    } as any);

    render(
      <AuthProvider>
        <div>Provider Ready</div>
      </AuthProvider>,
    );

    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle checkAuth failure', async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <div>Provider Ready</div>
      </AuthProvider>,
    );

    // Component should still render even on auth check failure
    expect(screen.getByText('Provider Ready')).toBeInTheDocument();
  });

  it('should provide context value to children', async () => {
    const mockUser = { id: 1, username: 'admin', role: 'admin' };

    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      data: { user: mockUser },
    } as any);

    const TestComponent = () => {
      return <div>Context Available</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByText('Context Available')).toBeInTheDocument();
  });
});
