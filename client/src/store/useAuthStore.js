import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setToken: (token) => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    } else {
      delete api.defaults.headers.common.Authorization;
      set({ token: null, isAuthenticated: false, user: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // First attempt refreshing token if cookie exists
      const refreshRes = await api.post('/auth/refresh');
      const { accessToken } = refreshRes.data.data;
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Then fetch user profile
      const meRes = await api.get('/auth/me');
      set({
        user: meRes.data.data.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      delete api.defaults.headers.common.Authorization;
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      const { user, accessToken } = res.data.data;
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken } = res.data.data;
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      delete api.defaults.headers.common.Authorization;
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
