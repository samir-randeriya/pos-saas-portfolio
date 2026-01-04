import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const menuItems = [
    {
      title: "Manage Users",
      description: "View, manage, and impersonate all registered users",
      path: "/admin/users",
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      stats: "All Users"
    },
    {
      title: "View Subscriptions",
      description: "Monitor all active and expired subscriptions",
      path: "/admin/subscriptions",
      icon: "📋",
      color: "from-green-500 to-green-600",
      stats: "All Plans"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar type="admin" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navbar */}
        <Navbar userName={user?.name || "Admin"} />
        
        {/* Page Content */}
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage your POS SaaS platform</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">—</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">—</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Revenue (MTD)</p>
                  <p className="text-2xl font-bold text-gray-900">—</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group relative overflow-hidden border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all"
                >
                  {/* Background Gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16`}></div>
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {item.stats}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Go to {item.title.split(' ')[0]}</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
