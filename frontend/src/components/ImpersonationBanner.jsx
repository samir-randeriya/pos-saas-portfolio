import api from "../services/api";

export default function ImpersonationBanner() {
  const exit = async () => {
    try {
      await api.post("/impersonate/exit");
      
      // Restore admin token if it exists
      const adminToken = localStorage.getItem("admin_token");
      if (adminToken) {
        localStorage.setItem("token", adminToken);
        localStorage.removeItem("admin_token");
      } else {
        localStorage.removeItem("token");
      }
      
      localStorage.removeItem("impersonating");
      window.location.href = "/admin/users";
    } catch (err) {
      console.error("Failed to exit impersonation:", err);
      // Still try to restore admin session
      const adminToken = localStorage.getItem("admin_token");
      if (adminToken) {
        localStorage.setItem("token", adminToken);
        localStorage.removeItem("admin_token");
      }
      localStorage.removeItem("impersonating");
      window.location.href = "/admin/users";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold text-sm">
            🎭 Admin Mode: You are currently impersonating a user
          </span>
        </div>
        <button
          onClick={exit}
          className="px-4 py-1.5 bg-white text-orange-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
        >
          Exit Impersonation
        </button>
      </div>
    </div>
  );
}
