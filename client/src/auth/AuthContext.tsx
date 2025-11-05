import { createContext, useContext, useState } from "react";

type User = { userId: string; displayName?: string | null; email: string };
type AuthCtx = {
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string }) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) as User : null;
  });

  const setAuth = ({ user, token }: { user: User; token: string }) => {
    setUser(user); setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return <Ctx.Provider value={{ user, token, setAuth, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
