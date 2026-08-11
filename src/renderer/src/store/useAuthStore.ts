import { create } from "zustand";
import type { AuthUser } from "../../../shared/ipc";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: async (credentials) => {
    const user = await window.api.auth.login(credentials);
    set({ isLoggedIn: true, user });
  },
  logout: () => set({ isLoggedIn: false, user: null }),
}));
