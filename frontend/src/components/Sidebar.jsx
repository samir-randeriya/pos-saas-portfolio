import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ type = "client" }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const clientLinks = [
    { path: "/app/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/app/billing", label: "Billing", icon: "💳" }
  ];
  
  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/subscriptions", label: "Subscriptions", icon: "📋" }
  ];
  
  const links = type === "admin" ? adminLinks : clientLinks;
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">
          {type === "admin" ? "Admin Panel" : "POS SaaS"}
        </h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer Section */}
      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          {type === "admin" ? "Admin Portal" : "Client Portal"}
        </p>
        <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
      </div>
    </aside>
  );
}
