/*
 * Small helpers for reading who is logged in.
 * Used by RequireRole (route guard) and RoleNavbar.
 */

export type UserRole = "TRAVELER" | "OWNER" | "ADMIN";

export interface StoredUser {
  id: number;
  name?: string;
  email?: string;
  role: UserRole;
}

/** Reads the "exp" claim of a JWT (seconds since 1970), or null. */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json).exp;

    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    /* storage unavailable */
  }
}

/**
 * Returns the logged-in user, or null when nobody is logged in
 * (or the login has expired, in which case it is cleared).
 */
export function getCurrentUser(): StoredUser | null {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token || !raw) {
      return null;
    }

    const exp = getTokenExpiry(token);

    if (exp !== null && exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }

    const user = JSON.parse(raw);

    if (
      user?.role !== "TRAVELER" &&
      user?.role !== "OWNER" &&
      user?.role !== "ADMIN"
    ) {
      return null;
    }

    return user as StoredUser;
  } catch {
    return null;
  }
}

/** Where each role belongs after login / when sent away from a page. */
export function homePathForRole(role: UserRole | undefined): string {
  if (role === "OWNER") return "/owner/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/";
}