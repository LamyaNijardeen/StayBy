import { getCurrentUser } from "../services/auth";
import Navbar from "./Navbar";
import TravelerNavbar from "./TravelerNavbar";
import OwnerNavbar from "./OwnerNavbar";
import AdminNavbar from "./AdminNavbar";

/**
 * For pages anyone can open (search, property details, info pages).
 * Shows the navbar that matches who is actually logged in:
 * nobody -> public navbar, otherwise the traveler / owner / admin one.
 */
function RoleNavbar() {
  const user = getCurrentUser();

  if (!user) return <Navbar />;
  if (user.role === "OWNER") return <OwnerNavbar />;
  if (user.role === "ADMIN") return <AdminNavbar />;

  return <TravelerNavbar />;
}

export default RoleNavbar;