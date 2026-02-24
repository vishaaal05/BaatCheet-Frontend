import { create } from 'zustand';

type AuthState = {
  token: string | null;
  userId: number | null;
  setAuth: (token: string | null, userId: number | null) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  userId: null,
  setAuth: (token, userId) => set({ token, userId }),
}));
