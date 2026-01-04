import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  role,
  clientOnly = false,
}) {
  const { user, loading } = useContext(AuthContext);
  const isImpersonating = localStorage.getItem("impersonating") === "true";

  /**
   * 1️⃣ Still loading auth state
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-700 rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading session…</p>
        </div>
      </div>
    );
  }

  /**
   * 2️⃣ Not authenticated → login
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 3️⃣ Role-specific route guard (admin / client)
   */
  if (role && user.role?.name !== role) {
    return <Navigate to="/" replace />;
  }

  /**
   * 4️⃣ Client-only routes
   * Prevent admins from accessing client UI unless impersonating
   */
  if (clientOnly && user.role?.name === "admin" && !isImpersonating) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /**
   * 5️⃣ Authorized
   */
  return children;
}
