export type Role = "care_manager" | "parent" | "child";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
};

const TOKEN_KEY = "ehm_token";
const USER_KEY = "ehm_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem("token");
}

export function setAuth(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem("token", token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("token");
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem("user");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY) ?? window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

