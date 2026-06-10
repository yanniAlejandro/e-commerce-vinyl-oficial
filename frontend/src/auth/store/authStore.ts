import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../../shared/api/client';
import type { TokenResponse, User } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      hydrate: () => {
        const token = localStorage.getItem('vinyl_token');
        const userRaw = localStorage.getItem('vinyl_user');
        if (token && userRaw) {
          set({ token, user: JSON.parse(userRaw) as User });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await apiRequest<TokenResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          localStorage.setItem('vinyl_token', data.access_token);
          localStorage.setItem('vinyl_user', JSON.stringify(data.user));
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const data = await apiRequest<TokenResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name: fullName }),
          });
          localStorage.setItem('vinyl_token', data.access_token);
          localStorage.setItem('vinyl_user', JSON.stringify(data.user));
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('vinyl_token');
        localStorage.removeItem('vinyl_user');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'vinyl-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
