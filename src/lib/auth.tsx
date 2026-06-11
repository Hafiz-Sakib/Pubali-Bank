// Dummy/local authentication — no external provider.
// Sessions persist in localStorage. Two predefined demo accounts (admin + customer).
// New sign-ups are stored locally and given the "customer" role.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  role: Role;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthState {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const SESSION_KEY = "pbl_auth_session_v1";
const USERS_KEY = "pbl_auth_users_v1";

export const DEMO_ADMIN = {
  email: "admin@pubalibank.com",
  password: "admin123",
};
export const DEMO_CUSTOMER = {
  email: "customer@pubalibank.com",
  password: "customer123",
};

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

function deriveAccountNumber(id: string) {
  const digits = id.replace(/\D/g, "").padEnd(12, "0").slice(0, 12);
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

function uid() {
  return "u-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as StoredUser[];
  } catch {}
  return [];
}

function writeUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedDemoUsers(): StoredUser[] {
  const existing = readUsers();
  const map = new Map(existing.map((u) => [u.email.toLowerCase(), u]));
  const ensure = (u: StoredUser) => {
    if (!map.has(u.email.toLowerCase())) map.set(u.email.toLowerCase(), u);
  };
  ensure({
    id: "demo-admin-0001",
    name: "Anika Rahman",
    email: DEMO_ADMIN.email,
    password: DEMO_ADMIN.password,
    role: "admin",
  });
  ensure({
    id: "demo-customer-0001",
    name: "Rafiq Hossain",
    email: DEMO_CUSTOMER.email,
    password: DEMO_CUSTOMER.password,
    role: "customer",
  });
  const next = Array.from(map.values());
  writeUsers(next);
  return next;
}

function toAuthUser(u: StoredUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    accountNumber: deriveAccountNumber(u.id),
    role: u.role,
  };
}

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as AuthUser;
  } catch {}
  return null;
}

function writeSession(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) window.localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDemoUsers();
    setUser(readSession());
    setReady(true);
  }, []);

  const persist = (u: AuthUser | null) => {
    writeSession(u);
    setUser(u);
  };

  const login: AuthState["login"] = async (email, password) => {
    await new Promise((r) => setTimeout(r, 350));
    const users = seedDemoUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!match) return { ok: false, error: "Invalid email or password" };
    persist(toAuthUser(match));
    return { ok: true };
  };

  const signUp: AuthState["signUp"] = async (fullName, email, password) => {
    await new Promise((r) => setTimeout(r, 350));
    const users = seedDemoUsers();
    if (users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists" };
    }
    const stored: StoredUser = {
      id: uid(),
      name: fullName.trim(),
      email: email.trim(),
      password,
      role: "customer",
    };
    writeUsers([...users, stored]);
    persist(toAuthUser(stored));
    return { ok: true };
  };

  const signInWithGoogle: AuthState["signInWithGoogle"] = async () => {
    return { ok: false, error: "Google sign-in is disabled in the demo. Use a demo account below." };
  };

  const forgotPassword: AuthState["forgotPassword"] = async () => {
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true };
  };

  const updatePassword: AuthState["updatePassword"] = async (newPassword) => {
    if (!user) return { ok: false, error: "Not signed in" };
    if (!newPassword || newPassword.length < 6)
      return { ok: false, error: "Password must be at least 6 characters" };
    const users = seedDemoUsers();
    const next = users.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u));
    writeUsers(next);
    return { ok: true };
  };

  const logout: AuthState["logout"] = async () => {
    persist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        ready,
        login,
        signUp,
        signInWithGoogle,
        forgotPassword,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
