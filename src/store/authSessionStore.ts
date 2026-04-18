import { create } from "zustand";
import { AuthSession } from "../entities/auth/model/types";

type AuthSessionStore = {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionStore>((set) => ({
  session: null,

  setSession: (session) =>
    set({
      session,
    }),

  clearSession: () =>
    set({
      session: null,
    }),
}));
