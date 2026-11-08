import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getCurrentUser,
  homePathForRole,
  type UserRole,
} from "../services/auth";

interface RequireRoleProps {
  /** Roles allowed on this page. Leave out to allow any logged-in user. */
  roles?: UserRole[];
  children: ReactNode;
}

/**
 * Route guard.
 * - Not logged in  -> login page
 * - Wrong role     -> that role's own home page
 *
 * This keeps people out of pages that are not theirs. The real
 * protection is still on the server (@PreAuthorize), because anyone
 * can edit what is stored in their own browser.
 */
function RequireRole({ roles, children }: RequireRoleProps) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <>{children}</>;
}

export default RequireRole;